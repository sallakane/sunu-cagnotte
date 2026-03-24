import { createBrowserRouter } from "react-router-dom";
import { RequireAdmin } from "../components/RequireAdmin";
import { RequireAuth } from "../components/RequireAuth";
import { AdminLayout } from "../layouts/AdminLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AdminFundraisersPage } from "../pages/AdminFundraisersPage";
import { AboutPage } from "../pages/AboutPage";
import { ContactPage } from "../pages/ContactPage";
import { CreateFundraiserPage } from "../pages/CreateFundraiserPage";
import { DashboardHomePage } from "../pages/DashboardHomePage";
import { FaqPage } from "../pages/FaqPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { FundraiserDetailPage } from "../pages/FundraiserDetailPage";
import { FundraisersPage } from "../pages/FundraisersPage";
import { HomePage } from "../pages/HomePage";
import { LegalPage } from "../pages/LegalPage";
import { LoginPage } from "../pages/LoginPage";
import { MyFundraisersPage } from "../pages/MyFundraisersPage";
import { PaymentReturnPage } from "../pages/PaymentReturnPage";
import { PaymentTestPage } from "../pages/PaymentTestPage";
import { ProfileSettingsPage } from "../pages/ProfileSettingsPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "cagnottes", element: <FundraisersPage /> },
      { path: "cagnottes/:slug", element: <FundraiserDetailPage /> },
      { path: "inscription", element: <RegisterPage /> },
      { path: "connexion", element: <LoginPage /> },
      { path: "mot-de-passe-oublie", element: <ForgotPasswordPage /> },
      { path: "reinitialiser-mot-de-passe", element: <ResetPasswordPage /> },
      { path: "qui-sommes-nous", element: <AboutPage /> },
      { path: "faq", element: <FaqPage /> },
      { path: "contact", element: <ContactPage /> },
      {
        path: "mentions-legales",
        element: (
          <LegalPage
            kind="mentions"
          />
        ),
      },
      {
        path: "politique-confidentialite",
        element: (
          <LegalPage
            kind="privacy"
          />
        ),
      },
      {
        path: "cgu",
        element: (
          <LegalPage
            kind="terms"
          />
        ),
      },
      { path: "paiement/retour", element: <PaymentReturnPage /> },
      { path: "paiement/test/:reference", element: <PaymentTestPage /> },
    ],
  },
  {
    path: "/espace",
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: "cagnottes", element: <MyFundraisersPage /> },
      { path: "cagnottes/nouvelle", element: <CreateFundraiserPage /> },
      { path: "cagnottes/:id/modifier", element: <CreateFundraiserPage /> },
      { path: "profil", element: <ProfileSettingsPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [{ index: true, element: <AdminFundraisersPage /> }],
  },
]);
