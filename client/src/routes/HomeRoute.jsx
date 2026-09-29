import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout.jsx";
import Home from "../pages/Home.jsx";
import Landing from "../pages/Landing.jsx";
import BrandLogo from "../components/ui/BrandLogo.jsx";

/**
 * `/` keeps its URL: signed-out visitors get the landing page, signed-in users get
 * the Home dashboard inside the application shell.
 */
export default function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="bm-page bm-boot" role="status" aria-live="polite" aria-busy="true">
        <BrandLogo showWordmark tagline="Human review" />
        <span className="bm-visually-hidden">Loading Boardmates</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Layout>
        <Home />
      </Layout>
    );
  }

  return <Landing />;
}
