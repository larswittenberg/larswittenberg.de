const path = require('path');

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
	// https://nextjs.org/docs/api-reference/next.config.js/react-strict-mode
	reactStrictMode: true,
	// Configure `pageExtensions`` to include MDX files
	pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
	// https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
	turbopack: {
		root: path.join(__dirname, '..'),
	},
};

module.exports = withMDX(nextConfig);
