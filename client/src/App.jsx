import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
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
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import "./App.css";

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-auth-loading" role="status" aria-live="polite" aria-busy="true">
        <div className="app-auth-loading-card">
          <div className="app-auth-loading-brand">
            <div className="app-auth-loading-logo" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <span className="app-auth-loading-title">Boardmates</span>
          </div>
          <div className="app-auth-loading-grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="app-auth-loading-msg">
            Restoring your session<span aria-hidden="true">…</span>
          </p>
        </div>
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
      <ThemeProvider>
        <AuthProvider>
          <Analytics />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Feed />} />
              <Route path="submit" element={<SubmitGame />} />
              <Route path="game-detail/:id" element={<GameDetail />} />
              <Route
                path="profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="review-game/:id"
                element={
                  <RequireAuth>
                    <ReviewGame />
                  </RequireAuth>
                }
              />
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
