# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15.5.6 application using React 19, TypeScript, and Tailwind CSS 4. This project is bootstrapped with `create-next-app` and uses the App Router architecture with Turbopack for development and builds.

## Development Commands

**Start development server:**
```bash
npm run dev
# or with pnpm
pnpm dev
```
Development server runs on http://localhost:3000 with Turbopack for fast refresh.

**Build for production:**
```bash
npm run build
# or with pnpm
pnpm build
```

**Start production server:**
```bash
npm start
# or with pnpm
pnpm start
```

## Architecture

### App Router Structure
- Uses Next.js App Router (not Pages Router)
- Main application code lives in `/app` directory
- `app/layout.tsx`: Root layout with Geist font configuration and global styles
- `app/page.tsx`: Homepage component
- `app/globals.css`: Global styles with Tailwind CSS v4 imports and CSS variables for theming

### Styling System
- Tailwind CSS 4 configured via PostCSS (`@tailwindcss/postcss`)
- CSS variables for theming: `--background`, `--foreground`, `--font-sans`, `--font-mono`
- Dark mode support via `prefers-color-scheme` media query
- Geist font family for sans-serif and monospace fonts

### TypeScript Configuration
- Path alias `@/*` maps to project root for absolute imports
- Strict mode enabled
- Module resolution: `bundler`
- Target: ES2017

### Key Dependencies
- React 19.1.0 with new concurrent features
- Next.js 15.5.6 with Turbopack support
- Tailwind CSS 4 (latest major version)

## Project Patterns

**Font Loading:**
Fonts are loaded via `next/font/google` in the root layout and applied using CSS variables.

**Image Optimization:**
Use Next.js `<Image>` component from `next/image` for automatic optimization.

**CSS Theming:**
Color scheme is managed through CSS variables defined in `globals.css` with automatic dark mode support.
- Use pnpm for package manager commands