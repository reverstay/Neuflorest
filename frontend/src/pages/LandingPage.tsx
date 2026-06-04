import { useLang } from "../contexts/language/LangProvider";
import { TRANSLATIONS } from "../i18n/translations";
import type { NavigateToPage } from "../types/navigation";

type LandingPageProps = {
  setPage: NavigateToPage;
};

export function LandingPage({ setPage }: LandingPageProps) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang].landing;
  const heroLines = t.hero.split("\n");

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-tag">✦ Smart Green Ecosystem</div>
          <h1>
            {heroLines.map((line, index) => (
              <span key={line}>
                {index === 0 ? <em>{line}</em> : line}
                <br />
              </span>
            ))}
          </h1>
          <p className="hero-sub">{t.heroSub}</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setPage("shop")} type="button">
              {t.cta}
            </button>
            <button className="btn-ghost" type="button">
              {t.ctaSecondary}
            </button>
          </div>
        </div>
        <div className="hero-visual">🌿</div>
      </section>

      <div className="container">
        <div className="stats-bar">
          {[
            ["12.400+", t.statsPlants],
            ["3.200+", t.statsDevices],
            ["47", t.statsCities],
          ].map(([value, label]) => (
            <div className="stat-item" key={label}>
              <span className="stat-num">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="features">
        <div className="container">
          <div className="section-tag">● {t.offerTag}</div>
          <h2 className="section-title">{t.offerTitle}</h2>
          <div className="features-grid">
            {[
              ["🖨️", t.feat1Title, t.feat1Desc],
              ["🌱", t.feat2Title, t.feat2Desc],
              ["📡", t.feat3Title, t.feat3Desc],
            ].map(([icon, title, desc]) => (
              <article className="feature-card" key={title}>
                <span className="feature-icon">{icon}</span>
                <div className="feature-title">{title}</div>
                <p className="feature-desc">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="testim">
        <div className="container">
          <div className="section-tag">● {t.testimTitle}</div>
          <div className="testim-grid">
            {[
              [t.testim1, t.testim1Author],
              [t.testim2, t.testim2Author],
            ].map(([text, author]) => (
              <article className="testim-card" key={author}>
                <p className="testim-text">"{text}"</p>
                <span className="testim-author">{author}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
