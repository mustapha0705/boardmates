import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async (accessToken) => {
    const url = `${import.meta.env.VITE_API_URL}/profile`;
    const headers = { Authorization: `Bearer ${accessToken}` };

    async function tryFetch() {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (mountedRef.current) setProfile(data);
        return data;
      }
      return res;
    }

    try {
      let result = await tryFetch();
      if (result instanceof Response && result.status === 429) {
        await new Promise((r) => setTimeout(r, 800));
        result = await tryFetch();
      }
      if (result instanceof Response) {
        if (mountedRef.current) setProfile(null);
        return null;
      }
      return result;
    } catch {
      if (mountedRef.current) setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mountedRef.current) return;
      setSession(s);
      if (s?.access_token) {
        fetchProfile(s.access_token).finally(() => {
          if (mountedRef.current) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mountedRef.current) return;
      setSession(s);
      // INITIAL_SESSION is already followed by getSession() above; fetching profile twice
      // doubles traffic and can hit rate limits during dev (Strict Mode, HMR).
      if (event === "INITIAL_SESSION") return;
      if (s?.access_token) {
        const existing = await fetchProfile(s.access_token);
        if (!existing && s.user?.user_metadata?.displayName) {
          const meta = s.user.user_metadata;
          const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${s.access_token}`,
            },
            body: JSON.stringify({
              displayName: meta.displayName,
              chessUsername: meta.chessUsername || null,
              rating: meta.rating || null,
            }),
          }).catch(() => null);
          if (res?.ok) {
            const p = await res.json();
            if (mountedRef.current) setProfile(p);
          }
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(async ({ email, password, displayName, chessUsername, rating }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { displayName, chessUsername: chessUsername || null, rating: rating ? parseInt(rating, 10) : null },
      },
    });
    if (error) throw error;

    const needsConfirmation = !data.session;

    if (data.session?.access_token) {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          displayName,
          chessUsername: chessUsername || null,
          rating: rating ? parseInt(rating, 10) : null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to create profile");
      }

      const profileData = await res.json();
      setProfile(profileData);
    }

    return { ...data, needsConfirmation };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(() => {
    if (session?.access_token) return fetchProfile(session.access_token);
    return Promise.resolve(null);
  }, [session, fetchProfile]);

  const viewerId = profile?.id ?? session?.user?.id ?? null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: profile,
        /** Same as Supabase auth user id; use when `user` is null (e.g. profile fetch failed). */
        viewerId,
        loading,
        isAuthenticated: !!session,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
