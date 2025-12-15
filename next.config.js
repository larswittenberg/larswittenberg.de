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
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
	// https://nextjs.org/docs/api-reference/next.config.js/react-strict-mode
	reactStrictMode: true,
	// Configure `pageExtensions`` to include MDX files
	pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

module.exports = withMDX(nextConfig);
