# GitHub Copilot Instructions

## Priority Guidelines

When generating code for this repository:

1. **Version Compatibility**: Always respect the exact versions of languages, frameworks, and libraries used in this project
2. **Codebase Patterns**: Prioritize patterns and standards found in the existing codebase
3. **Architectural Consistency**: Maintain the Next.js App Router architecture and established component patterns
4. **Code Quality**: Prioritize maintainability, accessibility, and consistency in all generated code

## Technology Versions

### Core Technologies

| Technology | Version | Notes |
|------------|---------|-------|
| Node.js | 24 | Defined in `.nvmrc` |
| Next.js | 16.x | App Router architecture |
| React | 19.x | No need to import React in JSX files |
| TypeScript | 5.x | Strict null checks enabled |
| Tailwind CSS | 4.x | With Typography plugin |
| Yarn | 4.x | Package manager (defined in `packageManager` field) |

### Key Dependencies

- `@mdx-js/react` & `next-mdx-remote` - MDX content handling
- `gray-matter` - Frontmatter parsing
- `classnames` - Conditional CSS class composition
- `@vercel/analytics` & `@vercel/speed-insights` - Analytics integration

## Project Architecture

### App Router Structure

```
src/app/
├── layout.tsx          # Root layout (metadata, Analytics, SpeedInsights)
├── page.tsx            # Homepage
├── not-found.tsx       # 404 page
├── sitemap.ts          # Dynamic sitemap generation
├── blog/
│   ├── page.tsx        # Blog listing
│   ├── [slug]/page.tsx # Dynamic blog post pages
│   └── blogposts/      # MDX content files
├── about/page.tsx
├── impressum/          # German legal page
└── uses/               # Uses page with MDX
```

### Component Organization

```
src/components/
├── atoms/              # Small, reusable UI components
│   ├── CustomLink.tsx
│   ├── CustomFigure.tsx
│   └── FlexWrapper.tsx
├── Header.tsx          # Site header with navigation
├── Footer.tsx          # Site footer
├── LayoutDefault.tsx   # Main layout wrapper
└── SocialIcons.tsx     # Social media icons
```

## Code Patterns

### Component Structure

Follow this pattern for React components:

```tsx
// 1. Imports - external packages first, then internal
import { ReactNode } from 'react';
import cn from 'classnames';
import Header from '@/components/Header';

// 2. TypeScript interfaces inline in function signature or separate
interface Props {
	children: ReactNode;
	fullWidth?: boolean;
}

// 3. Default export function component
export default function ComponentName({ children, fullWidth }: Props) {
	// Component logic
	return (
		<div className="...">
			{children}
		</div>
	);
}
```

### Naming Conventions

- **Components**: PascalCase (`Header.tsx`, `CustomLink.tsx`, `LayoutDefault.tsx`)
- **Utilities**: kebab-case (`mdx-utils.ts`)
- **MDX files**: kebab-case (`alpen-bikepacking-2022.mdx`)
- **CSS files**: kebab-case (`main.css`, `debugging.css`)
- **Variables/Functions**: camelCase
- **Interfaces**: PascalCase, descriptive names (`Frontmatter`, `Props`)

### Import Patterns

Use path aliases for internal imports:

```tsx
// ✅ Correct - use path aliases
import LayoutDefault from '@/components/LayoutDefault';
import { getBlogPosts } from '@/utils/mdx-utils';
import '@/styles/main.css';

// ❌ Avoid - relative paths for deep imports
import LayoutDefault from '../../../components/LayoutDefault';
```

Available aliases:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/styles/*` → `./src/styles/*`

### Styling Patterns

Use Tailwind CSS with these conventions:

```tsx
// Inline Tailwind classes for simple styling
<div className="mx-4 lg:mx-auto lg:my-12 lg:w-11/12">

// Use classnames package for conditional classes
import cn from 'classnames';

let ClassNames = cn({
	'grow mx-4 md:mx-10 lg:mx-auto': true,
	'prose dark:prose-invert lg:prose-lg': prose,
	'max-w-prose': !fullWidth,
});

// Dark mode: use dark: prefix
<body className="bg-slate-50 text-slate-800 dark:bg-darkblue dark:text-gray-200">
```

### MDX Content Handling

Blog posts use this frontmatter format:

```yaml
---
title: 'Post Title'
date: '2024-01-15'
update: '2024-02-01'    # Optional
desc: 'Brief description'
image: '/images/blog/post-slug/cover.jpg'
draft: false            # Set true to hide from production
---
```

### Metadata Pattern

Use Next.js Metadata API:

```tsx
import type { Metadata } from 'next';

// Static metadata
export const metadata: Metadata = {
	title: 'Page Title',
	description: 'Page description',
};

// Dynamic metadata
export async function generateMetadata(props: Props): Promise<Metadata> {
	const params = await props.params;
	// Return metadata based on params
}
```

### Async Patterns in Next.js 16

Props with params/searchParams are now Promises:

```tsx
interface Props {
	params: Promise<{ slug: string }>;
}

export default async function Page(props: Props) {
	const params = await props.params;
	const { slug } = params;
	// Use slug
}
```

## Code Quality Standards

### TypeScript

- Use TypeScript for all new files (`.tsx` for JSX, `.ts` for pure TypeScript)
- Define interfaces for component props
- Avoid `any` type when possible (though it's allowed per ESLint config)
- Unused variables trigger errors

### ESLint Rules

- **Quotes**: Single quotes required (`'string'`)
- **React**: No need to import React (React 19)
- **Prop Types**: Not required (TypeScript handles this)
- **Unescaped entities**: Use `{'>'}` or `{'}'}` for special characters in JSX

### Accessibility

- Use semantic HTML elements
- Include `role` and `aria-label` for decorative/interactive elements:
  ```tsx
  <span role="img" aria-label="Friedenszeichen Emoji">✌️</span>
  ```
- Ensure keyboard navigation with focus-visible styles
- Use the site's German language (`lang="de"`)

### Performance

- Use Next.js Image component for optimized images
- Leverage static generation with `generateStaticParams`
- Keep components focused and minimal

## File Templates

### New Page

```tsx
import { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';

export const metadata: Metadata = {
	title: 'Page Title',
};

export default function PageName() {
	return (
		<LayoutDefault prose>
			<h1>Page Title</h1>
			{/* Content */}
		</LayoutDefault>
	);
}
```

### New Component

```tsx
interface Props {
	children?: React.ReactNode;
	className?: string;
}

export default function ComponentName({ children, className }: Props) {
	return (
		<div className={className}>
			{children}
		</div>
	);
}
```

## Brand Guidelines

- **Primary Color (Orange)**: `#ef7c17` - Used for accents, links, selection
- **Dark Blue**: `#1c2532` - Used for dark mode background
- **Language**: German (site content is in German)

## Commands Reference

```bash
# Development
yarn dev          # Start dev server on localhost:3000
yarn build        # Production build
yarn start        # Start production server

# Code Quality
yarn lint         # Run ESLint
yarn format       # Format with Prettier

# Maintenance
yarn clean        # Remove .next directory
```

## Files to Never Edit

- `next-env.d.ts` - Auto-generated by Next.js
- Files in `.next/` directory
- Files in `node_modules/`

## Additional Context

- This is a personal website/blog
- Deployed on Vercel with automatic deployments
- Uses Vercel Analytics and Speed Insights
- React Strict Mode is enabled
- Typography plugin handles prose styling for blog content
