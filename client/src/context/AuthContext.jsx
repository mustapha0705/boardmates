import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { getAuthEmailRedirectTo } from "../lib/authRedirect";
import { AuthContext } from "./auth-context";

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

  const hydrateProfileFromAuthMetadata = useCallback(async (sessionValue, existingProfile) => {
    const accessToken = sessionValue?.access_token;
    const meta = sessionValue?.user?.user_metadata || {};
    const chessUsername = String(meta.chessUsername || "").trim().toLowerCase();
    const chessPlatform = String(meta.chessPlatform || "").trim();
    const profileNeedsHydration = !existingProfile || !existingProfile.chessUsername || !existingProfile.chessPlatform;

    if (!accessToken || !profileNeedsHydration || !chessUsername || !chessPlatform) {
      return existingProfile || null;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        chessUsername,
        chessPlatform,
      }),
    }).catch(() => null);

    if (res?.ok) {
      const profileData = await res.json();
      if (mountedRef.current) setProfile(profileData);
      return profileData;
    }

    return existingProfile || null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mountedRef.current) return;
      setSession(s);
      if (s?.access_token) {
        const existing = await fetchProfile(s.access_token);
        await hydrateProfileFromAuthMetadata(s, existing);
        if (mountedRef.current) setLoading(false);
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
        await hydrateProfileFromAuthMetadata(s, existing);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, hydrateProfileFromAuthMetadata]);

  const signUp = useCallback(async ({ email, password, chessPlatform, chessUsername }) => {
    const handle = String(chessUsername || "").trim().toLowerCase();

    const preflightRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate-chess-username`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chessUsername: handle,
        chessPlatform,
      }),
    });

    if (!preflightRes.ok) {
      const body = await preflightRes.json().catch(() => ({}));
      throw new Error(body.errors?.[0]?.message || body.message || "Failed to validate chess username");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthEmailRedirectTo(),
        data: {
          displayName: handle,
          chessUsername: handle,
          chessPlatform,
        },
      },
    });
    if (error) throw error;

    // Real new signup (email confirm on): session null and user has email identities.
    // Repeated signup: often user is null, or Supabase returns a user stub with identities: [] (still user_repeated_signup).
    const identities = data.user?.identities;
    const hasIdentities = Array.isArray(identities) && identities.length > 0;
    const legacyNewUser = !!data.user && identities == null;
    const needsConfirmation = !data.session && (hasIdentities || legacyNewUser);
    const repeatedSignup = !data.session && !needsConfirmation;

    if (data.session?.access_token) {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          chessUsername: handle,
          chessPlatform,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.errors?.[0]?.message || body.message || "Failed to create profile");
      }

      const profileData = await res.json();
      setProfile(profileData);
    }

    return {
      ...data,
      needsConfirmation,
      /** Email already registered (or no new identity created). */
      repeatedSignup,
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthEmailRedirectTo("/reset-password"),
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
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
        requestPasswordReset,
        updatePassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
