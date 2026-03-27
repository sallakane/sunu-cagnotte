import { Outlet } from "react-router-dom";
import { BetaLaunchBanner } from "../components/BetaLaunchBanner";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export function PublicLayout() {
  return (
    <div className="shell">
      <div className="shell__banner">
        <BetaLaunchBanner />
      </div>
      <SiteHeader />
      <main className="shell__main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
