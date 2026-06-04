# Frontend Architecture & Contribution Guide

## Purpose

This guide explains the current neuflower frontend reference architecture and how junior developers should extend it safely. The single-file `App.jsx` reference is a teaching artifact: it keeps theming, i18n, contexts, mock data, views, and global styles in one place so the team can understand the system before splitting it into production folders.

The production goal is simple: keep the same patterns, but separate responsibilities into small, reusable, testable modules.

## Design Direction

neuflower uses an **organic-luxury** visual language:

- Deep moss green for trust, nature, and primary actions.
- Warm sand and soft surfaces for calm, premium spacing.
- Copper/warm accent colors for emphasis and highlights.
- Elegant typography with `Playfair Display` for editorial headings.
- Clean product UI typography with `DM Sans` for body text, navigation, forms, and controls.

When building UI, use the design tokens from the theme object through CSS variables. Do not hardcode hex colors, shadow values, border colors, or radii inside components unless you are introducing a documented token.

## CSS Variable System

The reference app defines two theme maps: `light` and `dark`. Each map has the same CSS variable names, and `GlobalStyles` injects the selected map into `:root`.

This means components should be written once and automatically adapt to both themes:

```css
.product-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
```

Avoid this:

```css
.product-card {
  background: #ffffff;
  border: 1px solid #eeeeee;
}
```

### Token Reference

| Token | Intended use |
|---|---|
| `--bg` | Main page background. Use on `body`, full-page wrappers, and large layout regions. |
| `--bg2` | Secondary background. Use for section bands, product image wells, subtle panels, and contrast blocks. |
| `--bg3` | Tertiary background. Use sparingly for deeper nested contrast or inactive UI states. |
| `--surface` | Primary card and form surface. Use for product cards, login panels, dashboard cards, menus, and footer panels. |
| `--border` | Default low-contrast border. Use for cards, nav separators, inputs, and section boundaries. |
| `--border2` | Stronger border. Use on hover states, active outlines, dropdowns, and emphasized controls. |
| `--text` | Primary text. Use for headings, important labels, and high-priority content. |
| `--text2` | Secondary text. Use for descriptions, nav links, subtitles, and supporting copy. |
| `--text3` | Muted text. Use for metadata, timestamps, helper text, and low-priority labels. |
| `--primary` | Main brand/action color. Use for primary buttons, active navigation, important highlights, and brand moments. |
| `--primary2` | Primary hover/alternate state. Use for hover states and secondary brand emphasis. |
| `--primary3` | Deep/alternate primary shade. Use only when another green state is needed. |
| `--accent` | Warm accent. Use for tags, decorative labels, product badges, and luxury detail. |
| `--accent2` | Accent hover/contrast state. Use when the accent needs more warmth or visibility. |
| `--accentBg` | Soft accent background. Use behind small badges, tags, and warm highlighted content. |
| `--success` | Positive status. Use for healthy plants, successful actions, and confirmation states. |
| `--warn` | Warning status. Use for attention-needed plant health or recoverable issues. |
| `--danger` | Critical status. Use for destructive actions, failed states, or critical plant health. |
| `--radius` | Standard component radius. Use for cards, panels, and larger buttons. |
| `--radiusSm` | Smaller component radius. Use for dropdowns, compact inputs, and small controls. |
| `--shadow` | Default elevation. Use for cards or controls that need subtle lift. |
| `--shadowLg` | Strong elevation. Use for hovered cards, overlays, and prominent floating surfaces. |

## Typography Rules

Use typography intentionally:

- `Playfair Display` is for brand, hero, section, and card titles.
- `DM Sans` is for body text, forms, buttons, navigation, metrics, filters, and dashboard copy.
- Headings should feel editorial and premium.
- Functional UI text should stay clear, compact, and scannable.

Do not use heading fonts just because text is large. Use them when the content carries brand or editorial weight.

## State Management

The reference app uses React Context API for app-wide state that many components need:

- `ThemeContext`: owns the current theme and the `toggle` action.
- `LangContext`: owns the current language and the `setLang` action.
- `AuthContext`: owns the current mock user and login/logout actions.

The Context API is appropriate here because these states are global, low-frequency, and easy to reason about. We do not need Redux or a complex state library for this layer.

### Consuming Contexts

Use the custom hooks instead of calling `useContext` directly inside feature components:

```jsx
function HeaderActions() {
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useLang();
  const { user, logout } = useAuth();

  return null;
}
```

For translated text, read the active language from `useLang` and resolve copy from the dictionary:

```jsx
function ShopTitle() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang].shop;

  return <h1>{t.title}</h1>;
}
```

When the app is refactored, each context should live in its own file and expose:

- A provider component.
- A custom hook.
- The state shape/types.
- A small, explicit public API.

In TypeScript, the hook should fail fast if used outside its provider. That gives junior developers a helpful error instead of a confusing `undefined` bug.

## Internationalization

The reference app uses a dictionary-based i18n system with `pt-BR`, `en`, and `es`.

Follow these rules:

- Do not hardcode visible UI copy inside components if it already belongs in the dictionary.
- Add all supported languages when adding a new text key.
- Keep dictionary keys grouped by domain: `nav`, `landing`, `shop`, `login`, `dashboard`, `footer`.
- Use stable key names based on meaning, not temporary wording.

Good key naming:

```js
dashboard: {
  lastRead: "Last reading",
  irrigate: "Irrigate now",
}
```

Avoid key names tied to layout or copy experiments:

```js
dashboard: {
  greenButtonText: "Irrigate now",
}
```

## View Navigation

The reference uses state-based navigation:

```jsx
const [page, setPage] = useState("landing");
```

This is intentional for onboarding. It keeps the app easy to inspect while demonstrating multiple views:

- `Landing`
- `Shop`
- `Login`
- `Dashboard`

In production, this should be replaced with routing, but do not rush the migration until the components and contexts have been extracted cleanly.

## Component Best Practices

When contributing UI:

- Build small components with one clear responsibility.
- Prefer props over reaching into global state when data is local.
- Use Context only for truly app-wide concerns.
- Use design tokens for color, radius, shadows, borders, and backgrounds.
- Keep mock data separate from components.
- Keep translated copy separate from components.
- Keep layout components separate from business components.
- Make repeated UI elements reusable, such as cards, badges, buttons, filter pills, and metric displays.

Bad direction:

```jsx
function Dashboard() {
  // All plant card markup, status styles, mock data, and translations mixed together forever.
}
```

Better direction:

```jsx
function Dashboard() {
  // Composes reusable PlantStatusCard components.
}
```

## Styling Guidelines

The reference currently injects global styles through a `GlobalStyles` component. That is useful for a demo, but production should split styles into layers:

- `tokens.css` for CSS variables and theme foundations.
- `global.css` for resets, base body styles, typography, and shared primitives.
- Component-level CSS modules or colocated styles for component-specific classes.

Keep class names semantic:

- Good: `.product-card`, `.status-badge`, `.metric-value`
- Avoid: `.green-box`, `.big-text`, `.left-thing`

## Refactoring Plan

The junior developer's first major task should be to extract the reference file without changing behavior. Treat this as a careful move, not a redesign.

### Step 1: Extract Constants

Move static data into dedicated files:

- translations
- theme tokens
- product mock data
- plant status mock data

No component behavior should change in this step.

### Step 2: Extract Contexts

Create one folder per context:

- `ThemeProvider` and `useTheme`
- `LangProvider` and `useLang`
- `AuthProvider` and `useAuth`

Keep the provider composition in `App`.

### Step 3: Extract Shared Layout

Move shell-level UI into reusable layout components:

- `Navbar`
- `Footer`
- `Container`
- shared button/card primitives if needed

### Step 4: Extract Pages

Move each current view into its own page module:

- `LandingPage`
- `ShopPage`
- `LoginPage`
- `DashboardPage`

Each page should compose smaller components instead of becoming another large file.

### Step 5: Extract Feature Components

Break repeated UI into components:

- `ProductCard`
- `FeatureCard`
- `TestimonialCard`
- `PlantStatusCard`
- `Metric`
- `LanguageMenu`
- `ThemeToggle`

### Step 6: Introduce Routing Later

Only after the extraction is stable, replace `page` state with a router. The first refactor should preserve the mental model of the reference app.

## Target Folder Structure

```text
src/
├── app/
│   ├── App.tsx
│   └── providers.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│   ├── product/
│   │   └── ProductCard.tsx
│   ├── plant/
│   │   ├── PlantStatusCard.tsx
│   │   └── Metric.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── StatusBadge.tsx
│       └── ThemeToggle.tsx
├── contexts/
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   └── useAuth.ts
│   ├── language/
│   │   ├── LangProvider.tsx
│   │   └── useLang.ts
│   └── theme/
│       ├── ThemeProvider.tsx
│       └── useTheme.ts
├── data/
│   ├── products.ts
│   └── plantStatus.ts
├── i18n/
│   ├── translations.ts
│   └── types.ts
├── pages/
│   ├── LandingPage.tsx
│   ├── ShopPage.tsx
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── styles/
│   ├── tokens.css
│   ├── global.css
│   └── utilities.css
└── main.tsx
```

## Definition of Done for Frontend Contributions

A frontend PR is ready for review when:

- It uses existing CSS variables instead of hardcoded visual values.
- It does not duplicate large chunks of markup already represented by a component.
- New visible text is represented in every supported language.
- Context usage goes through custom hooks.
- Components receive data through props unless the state is truly global.
- The PR explains whether `funcionalidades.md` needs an update.
- The UI still works in both light and dark themes.

## Mentoring Notes

The reference app is intentionally compact. Its job is to teach the shape of the system, not to be the final folder architecture. When refactoring it, prefer small safe moves, keep behavior stable, and review after each layer is extracted. A clean extraction is more valuable than a clever rewrite.
