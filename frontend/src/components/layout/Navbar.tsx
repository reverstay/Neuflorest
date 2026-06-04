import { useState } from "react";

import { useAuth } from "../../contexts/auth/AuthProvider";
import { useLang } from "../../contexts/language/LangProvider";
import { useTheme } from "../../contexts/theme/ThemeProvider";
import { TRANSLATIONS, type Language } from "../../i18n/translations";
import type { NavigateToPage, PageId } from "../../types/navigation";

type NavbarProps = {
  page: PageId;
  setPage: NavigateToPage;
};

const LANGUAGE_OPTIONS: Array<{ value: Language; label: string; shortLabel: string }> = [
  { value: "pt-BR", label: "Português", shortLabel: "PT" },
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "es", label: "Español", shortLabel: "ES" },
];

export function Navbar({ page, setPage }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const t = TRANSLATIONS[lang].nav;
  const activeLanguage = LANGUAGE_OPTIONS.find((option) => option.value === lang);

  function handleLogout() {
    logout();
    setPage("landing");
  }

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <button className="nav-logo" onClick={() => setPage("landing")} type="button">
          Neu<span>Florest</span>
        </button>
        <button
          className={`nav-link ${page === "landing" ? "active" : ""}`}
          onClick={() => setPage("landing")}
          type="button"
        >
          {t.home}
        </button>
        <button
          className={`nav-link ${page === "shop" ? "active" : ""}`}
          onClick={() => setPage("shop")}
          type="button"
        >
          {t.shop}
        </button>
        {user && (
          <button
            className={`nav-link ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
            type="button"
          >
            {t.dashboard}
          </button>
        )}

        <div className="nav-actions">
          <div className="lang-dropdown">
            <button
              className="icon-btn lang-trigger"
              onClick={() => setLangOpen((isOpen) => !isOpen)}
              title={t.lang}
              type="button"
            >
              {activeLanguage?.shortLabel}
            </button>
            {langOpen && (
              <div className="lang-menu">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`lang-opt ${lang === option.value ? "active" : ""}`}
                    onClick={() => {
                      setLang(option.value);
                      setLangOpen(false);
                    }}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={toggle} title="theme" type="button">
            {theme === "light" ? "☾" : "☼"}
          </button>
          {user ? (
            <button className="nav-btn-outline" onClick={handleLogout} type="button">
              {t.logout}
            </button>
          ) : (
            <button className="nav-btn-outline" onClick={() => setPage("login")} type="button">
              {t.login}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
