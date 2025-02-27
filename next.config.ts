import createMDX from '@next/mdx';

const withMDX = createMDX({
	// extension: /\.mdx?$/,
	options: {
		// If you use remark-gfm, you'll need to use next.config.mjs
		// as the package is ESM only
		// https://github.com/remarkjs/remark-gfm#install
		// remarkPlugins: [],
		// rehypePlugins: [],
		// If you use `MDXProvider`, uncomment the following line.
		// providerImportSource: "@mdx-js/react",
	},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	// https://nextjs.org/docs/api-reference/next.config.js/react-strict-mode
	reactStrictMode: true,
	// Configure `pageExtensions`` to include MDX files
	pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
	// Optionally, add any other Next.js config below

	// Note: Using the Rust compiler means we cannot use
	// rehype or remark plugins. For my app, this is fine.
	experimental: {
		mdxRs: true,
	},
};

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
