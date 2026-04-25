import { Outlet } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { TopBar } from "../components/TopBar";

export function PublicLayout() {
  return (
    <div className="shell">
      <div className="site-sticky">
        <TopBar />
        <SiteHeader />
      </div>
      <main className="shell__main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
