import { useState } from "react";

import { AuthProvider } from "./contexts/auth/AuthProvider";
import { LangProvider } from "./contexts/language/LangProvider";
import { ThemeProvider } from "./contexts/theme/ThemeProvider";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { ShopPage } from "./pages/ShopPage";
import type { PageId } from "./types/navigation";
import "./styles.css";

function AppShell() {
  const [page, setPage] = useState<PageId>("landing");
  const showFooter = page !== "login";
  const showNav = page !== "login";

  return (
    <>
      {showNav && <Navbar page={page} setPage={setPage} />}
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "shop" && <ShopPage />}
      {page === "login" && <LoginPage setPage={setPage} />}
      {page === "dashboard" && <DashboardPage />}
      {showFooter && <Footer setPage={setPage} />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;
