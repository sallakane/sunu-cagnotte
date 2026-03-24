import { Outlet } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export function PublicLayout() {
  return (
    <div className="shell">
      <SiteHeader />
      <main className="shell__main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

