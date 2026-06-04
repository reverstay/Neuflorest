import { useLang } from "../../contexts/language/LangProvider";
import { TRANSLATIONS } from "../../i18n/translations";
import type { NavigateToPage } from "../../types/navigation";

type FooterProps = {
  setPage: NavigateToPage;
};

export function Footer({ setPage }: FooterProps) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang].footer;
  const nav = TRANSLATIONS[lang].nav;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              Neu<span>Florest</span>
            </div>
            <div className="footer-tagline">{t.tagline}</div>
          </div>
          <div>
            <div className="footer-col-title">{t.links}</div>
            <button className="footer-link" onClick={() => setPage("landing")} type="button">
              {nav.home}
            </button>
            <button className="footer-link" onClick={() => setPage("shop")} type="button">
              {nav.shop}
            </button>
            <button className="footer-link" onClick={() => setPage("login")} type="button">
              {nav.login}
            </button>
          </div>
          <div>
            <div className="footer-col-title">{t.contact}</div>
            <button className="footer-link" type="button">
              {t.privacy}
            </button>
            <button className="footer-link" type="button">
              {t.terms}
            </button>
            <button className="footer-link" type="button">
              hello@neuflorest.com
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">
            © {new Date().getFullYear()} NeuFlorest. All rights reserved.
          </span>
          <span className="footer-mark">✦</span>
        </div>
      </div>
    </footer>
  );
}
