import { GoogleLogin } from "@react-oauth/google";
import { useState, type FormEvent } from "react";

import {
  ApiError,
  loginWithGoogle,
  loginWithPassword,
  resendOtp,
  signUp,
  verifyOtp,
} from "../api";
import { useAuth } from "../contexts/auth/AuthProvider";
import { useLang } from "../contexts/language/LangProvider";
import { TRANSLATIONS } from "../i18n/translations";
import type { NavigateToPage } from "../types/navigation";

type LoginPageProps = {
  setPage: NavigateToPage;
};

type AuthMode = "login" | "signup" | "otp";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.payload && typeof error.payload === "object") {
    const payload = error.payload as Record<string, unknown>;
    const detail = payload.detail ?? payload.non_field_errors;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail) && typeof detail[0] === "string") {
      return detail[0];
    }
  }

  return fallback;
}

export function LoginPage({ setPage }: LoginPageProps) {
  const { lang } = useLang();
  const { completeLogin } = useAuth();
  const t = TRANSLATIONS[lang].login;
  const [mode, setMode] = useState<AuthMode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function completeAuth(response: Parameters<typeof completeLogin>[0]) {
    completeLogin(response);
    setPage("dashboard");
  }

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await loginWithPassword(email, password);
      completeAuth(response);
    } catch (authError) {
      setError(getErrorMessage(authError, t.authError));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await signUp({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      setPendingEmail(response.email);
      setMode("otp");
      setMessage(response.detail);
    } catch (authError) {
      setError(getErrorMessage(authError, t.authError));
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await verifyOtp(pendingEmail || email, otpCode);
      completeAuth(response);
    } catch (authError) {
      setError(getErrorMessage(authError, t.authError));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await resendOtp(pendingEmail || email);
      setMessage(response.detail);
    } catch (authError) {
      setError(getErrorMessage(authError, t.authError));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential?: string) {
    if (!credential) {
      setError(t.authError);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await loginWithGoogle(credential);
      completeAuth(response);
    } catch (authError) {
      setError(getErrorMessage(authError, t.authError));
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "signup" ? t.signUpTitle : mode === "otp" ? t.otpTitle : t.title;
  const subtitle = mode === "signup" ? t.signUpSub : mode === "otp" ? t.otpSub : t.sub;

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
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              type="button"
            >
              {t.signInTab}
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                setMode("signup");
                setError("");
                setMessage("");
              }}
              type="button"
            >
              {t.signUpTab}
            </button>
          </div>

          <h1 className="login-title">{title}</h1>
          <p className="login-sub">{subtitle}</p>

          {mode === "login" && (
            <form onSubmit={handlePasswordLogin}>
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
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignUp}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-first-name">
                    {t.firstName}
                  </label>
                  <input
                    className="form-input"
                    id="signup-first-name"
                    onChange={(event) => setFirstName(event.target.value)}
                    type="text"
                    value={firstName}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-last-name">
                    {t.lastName}
                  </label>
                  <input
                    className="form-input"
                    id="signup-last-name"
                    onChange={(event) => setLastName(event.target.value)}
                    type="text"
                    value={lastName}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">
                  {t.email}
                </label>
                <input
                  className="form-input"
                  id="signup-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">
                  {t.password}
                </label>
                <input
                  className="form-input"
                  id="signup-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                />
              </div>
              <button className="btn-login" disabled={loading} type="submit">
                {loading ? "..." : t.createAccount}
              </button>
            </form>
          )}

          {mode === "otp" && (
            <form onSubmit={handleOtpVerify}>
              <div className="form-group">
                <label className="form-label" htmlFor="otp-code">
                  {t.otpCode}
                </label>
                <input
                  className="form-input otp-input"
                  id="otp-code"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ""))}
                  pattern="\d{6}"
                  placeholder="000000"
                  required
                  type="text"
                  value={otpCode}
                />
              </div>
              <button className="btn-login" disabled={loading} type="submit">
                {loading ? "..." : t.verifyOtp}
              </button>
              <button className="auth-link-btn" disabled={loading} onClick={handleResendOtp} type="button">
                {t.resendOtp}
              </button>
            </form>
          )}

          {message && <p className="auth-message">{message}</p>}
          {error && <p className="auth-error">{error}</p>}

          {mode !== "otp" && (
            <>
              <div className="login-divider">{t.orContinue}</div>
              <div className="google-login-wrap">
                {googleClientId ? (
                  <GoogleLogin
                    onError={() => setError(t.authError)}
                    onSuccess={(credentialResponse) => handleGoogleCredential(credentialResponse.credential)}
                    shape="pill"
                    size="large"
                    text={mode === "signup" ? "signup_with" : "signin_with"}
                    theme="outline"
                    width="320"
                  />
                ) : (
                  <p className="auth-provider-disabled">{t.googleUnavailable}</p>
                )}
              </div>
            </>
          )}

          <div className="login-footer">
            {mode === "login" ? t.noAccount : t.haveAccount}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setMessage("");
              }}
              type="button"
            >
              {mode === "login" ? t.register : t.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
