const withMDX = require('@next/mdx')({
	extension: /.mdx?$/,
	options: {
		// If you use remark-gfm, you'll need to use next.config.mjs
		// as the package is ESM only
		// https://github.com/remarkjs/remark-gfm#install
		remarkPlugins: [],
		rehypePlugins: [],
		// If you use `MDXProvider`, uncomment the following line.
		// providerImportSource: "@mdx-js/react",
	},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
	},
	images: {
		minimumCacheTTL: 2678400,
		formats: ['image/webp'],
		qualities: [60, 75],
		deviceSizes: [640, 768, 1024, 1280, 1536],
		imageSizes: [32, 48, 64, 96, 128, 256, 384, 400, 600, 800],
		localPatterns: [
			{
				pathname: '/images/**',
			},
		],
	},
	// https://nextjs.org/docs/api-reference/next.config.js/react-strict-mode
	reactStrictMode: true,
	// Configure `pageExtensions`` to include MDX files
	pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

module.exports = withMDX(nextConfig);
