module.exports = {
	mode: 'jit',
	// purge: false,
	purge: [
		'./pages/**/*.{js,jsx,ts,tsx}',
		'./components/**/*.{js,jsx,ts,tsx}',
	],
	darkMode: 'media', // or 'media' or 'class'
	theme: {
		extend: {
			colors: {
				'orange': '#ef7c17',
				'darkblue': '#1c2532',
			},
			typography: {
				DEFAULT: {
					css: {
						// color: '#ff0',
					},
				},
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
