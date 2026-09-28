import { useAuth } from "../context/useAuth";
import Layout from "../components/Layout.jsx";
import Feed from "../pages/Feed.jsx";
import Landing from "../pages/Landing.jsx";
import BrandLogo from "../components/ui/BrandLogo.jsx";

/**
 * `/` keeps its URL: signed-out visitors get the redesigned landing page,
 * signed-in users get the existing feed inside the app shell.
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
        <Feed />
      </Layout>
    );
  }

  return <Landing />;
}
