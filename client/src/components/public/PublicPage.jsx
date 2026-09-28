import PublicHeader from "./PublicHeader.jsx";
import PublicFooter from "./PublicFooter.jsx";
import "../../styles/public.css";

/** Frame for signed-out pages: skip link, header, main landmark and footer. */
export default function PublicPage({ showSectionNav = true, children }) {
  return (
    <div className="bm-page bm-public">
      <a className="bm-skip-link" href="#main-content">
        Skip to main content
      </a>
      <PublicHeader showSectionNav={showSectionNav} />
      <main id="main-content" className="bm-public__main">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
