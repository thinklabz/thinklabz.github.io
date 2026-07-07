# ZeroDot

A production-ready React application built with Vite, TypeScript, Tailwind CSS, Framer Motion, and Lucide React.

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
 ├── components/    # Reusable UI components
 ├── pages/        # Page-level components
 ├── data/         # Static data and constants
 ├── assets/       # Images, fonts, and other static assets
 ├── hooks/        # Custom React hooks
 ├── utils/        # Utility functions and helpers
 └── styles/       # Global styles and CSS
```

## Configuration

- **Tailwind CSS**: Configured in `tailwind.config.js`
- **TypeScript**: Configured in `tsconfig.json` and `tsconfig.node.json`
- **Vite**: Configured in `vite.config.ts` with path aliases
- **PostCSS**: Configured in `postcss.config.js`

## Path Aliases

The project includes path aliases for cleaner imports:

- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/pages/*` → `./src/pages/*`
- `@/data/*` → `./src/data/*`
- `@/assets/*` → `./src/assets/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/utils/*` → `./src/utils/*`
- `@/styles/*` → `./src/styles/*`
