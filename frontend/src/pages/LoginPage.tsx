import { useState, type FormEvent } from "react";

import { useAuth } from "../contexts/auth/AuthProvider";
import { useLang } from "../contexts/language/LangProvider";
import { TRANSLATIONS } from "../i18n/translations";
import type { NavigateToPage } from "../types/navigation";

type LoginPageProps = {
  setPage: NavigateToPage;
};

export function LoginPage({ setPage }: LoginPageProps) {
  const { lang } = useLang();
  const { login } = useAuth();
  const t = TRANSLATIONS[lang].login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      login({ name: email.split("@")[0], email });
      setPage("dashboard");
      setLoading(false);
    }, 900);
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-brand">
          neu<span>flower</span>
        </div>
        <div>
          <p className="login-quote">"{t.quote}"</p>
          <p className="login-quote-sub">neuflower © {new Date().getFullYear()}</p>
        </div>
        <div className="login-icons">🌿 🌵 🌸</div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h1 className="login-title">{t.title}</h1>
          <p className="login-sub">{t.sub}</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                {t.email}
              </label>
              <input
                className="form-input"
                id="login-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="login-password">
                  {t.password}
                </label>
                <span className="form-forgot">{t.forgot}</span>
              </div>
              <input
                className="form-input"
                id="login-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={password}
              />
            </div>
            <button className="btn-login" disabled={loading} type="submit">
              {loading ? "..." : t.submit}
            </button>
          </form>
          <div className="login-divider">{t.orContinue}</div>
          <div className="social-btns">
            <button className="social-btn" type="button">
              Google
            </button>
            <button className="social-btn" type="button">
              Apple
            </button>
          </div>
          <div className="login-footer">
            {t.noAccount} <button type="button">{t.register}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
