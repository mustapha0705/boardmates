import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout.jsx";
import Feed from "./pages/Feed.jsx";
import SubmitGame from "./pages/SubmitGame.jsx";
import Profile from "./pages/Profile.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import ReviewGame from "./pages/ReviewGame.jsx";
import GameDetail from "./pages/GameDetail.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/signup.jsx";
import "./App.css";

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "#6b6b7a" }}>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function RedirectIfAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Analytics />
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Feed />} />
              <Route path="profile" element={<Profile />} />
              <Route path="submit" element={<SubmitGame />} />
              <Route path="review-game/:id" element={<ReviewGame />} />
              <Route path="game-detail/:id" element={<GameDetail />} />
            </Route>
            <Route
              path="/login"
              element={
                <RedirectIfAuth>
                  <Login />
                </RedirectIfAuth>
              }
            />
            <Route
              path="/signup"
              element={
                <RedirectIfAuth>
                  <Signup />
                </RedirectIfAuth>
              }
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
