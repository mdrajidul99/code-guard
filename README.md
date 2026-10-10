# CodeGaurd

> A browser-based code protection, minification, obfuscation, formatting, and supported code restoration utility by **MRS Engineers BD**.

[![Deploy CodeGaurd to GitHub Pages](https://github.com/mdrajidul99/code-guard/actions/workflows/deploy.yml/badge.svg)](https://github.com/mdrajidul99/code-guard/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Live_Site-GitHub_Pages-0284c7)](https://mdrajidul99.github.io/code-guard/)

---

## 1. Project Overview

**CodeGaurd** is an open-source, client-side code utility designed specifically for website owners, frontend engineers, Blogger theme developers, and authors of standalone HTML applications.

It provides format-aware code processing pipelines for:
- **HTML Documents**: Whitespace compression, comment removal, inline style and script minification, and self-extracting container encapsulation.
- **JavaScript Files**: Industrial identifier mangling (`_0x...`), string lookup table rotation, hexadecimal character escape transformations, and syntax minification.
- **CSS Stylesheets**: High-density stylesheet minification with strict preservation of CSS custom properties (`--var`), media queries, keyframes, and browser vendor prefixes.
- **Blogger XML Themes**: Strict XML validation via `DOMParser`, CDATA skin style minification, and format-safe preservation of Blogger namespaces (`xmlns:b`, `xmlns:expr`), `<b:widget>`, and `<b:includable>` sections.
- **Restore & Beautify**: Code beautification, indentation formatting (2/4 spaces), hexadecimal (`\xHH`) and unicode (`\uHHHH`) string de-escaping, and string array table resolution.

---

## 2. Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 + `@tailwindcss/vite`
- **Styling**: Tailwind CSS v4 (Cybersecurity Dark & Crisp Light themes)
- **Formatting Engine**: `js-beautify`
- **Icons**: Lucide React
- **Deployment**: GitHub Pages via GitHub Actions (`dist/` directory)

---

## 3. Production Deployment & URLs

- **GitHub Repository**: [https://github.com/mdrajidul99/code-guard](https://github.com/mdrajidul99/code-guard)
- **Live Production URL**: [https://mdrajidul99.github.io/code-guard/](https://mdrajidul99.github.io/code-guard/)
- **Vite Base Path**: `/code-guard/`

---

## 4. Local Development Setup

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mdrajidul99/code-guard.git
cd code-guard
npm install
```

### Development Server

Run the Vite development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the URL provided in the console).

### Production Build

Compile the application into the production distribution directory (`dist/`):

```bash
npm run build
```

Verify that `dist/index.html` and compiled assets in `dist/assets/` are generated.

### Local Preview of Production Build

```bash
npm run preview
```

---

## 5. Automated GitHub Actions Deployment

The repository includes `.github/workflows/deploy.yml` for zero-configuration, automated deployments on pushes to `main`.

### One-Time GitHub Repository Configuration

To enable deployment to GitHub Pages:

1. Open your repository on GitHub: `https://github.com/mdrajidul99/code-guard`
2. Navigate to **Settings** → **Pages** (under Code and automation).
3. Under **Build and deployment** → **Source**, select **GitHub Actions** (do *not* select "Deploy from a branch").
4. Push your changes to the `main` branch or manually trigger the workflow from the **Actions** tab using `workflow_dispatch`.
5. The workflow builds the production bundle and deploys `dist/` directly to `https://mdrajidul99.github.io/code-guard/`.

---

## 6. Honest Code Security Notice

> **CodeGaurd helps make supported source code harder to read and reuse casually. Browser-delivered HTML, CSS, and JavaScript can still be inspected. No client-side transformation guarantees complete secrecy.**

- **Client-Side Reality**: Web browsers must decode and execute HTML, CSS, and JavaScript to render them. Any user with browser Developer Tools can inspect DOM elements and network calls.
- **Backend Recommendation**: Never embed private API keys, payment secrets, or server database credentials inside client-side files. Sensitive business logic should remain on an authenticated server.
- **Backups**: Code minification and identifier mangling are irreversible transformations that permanently discard comments and human-readable variable names. Always maintain backups of your original source files.

---

## 7. Developer Contact

- **Developer / Company**: MRS Engineers BD
- **Contact Email**: [mrs.engineers.bd26@gmail.com](mailto:mrs.engineers.bd26@gmail.com)
- **Issue Tracker**: [https://github.com/mdrajidul99/code-guard/issues](https://github.com/mdrajidul99/code-guard/issues)

---

© 2026 CodeGaurd. Engineered with integrity by MRS Engineers BD.
