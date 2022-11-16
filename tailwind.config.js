module.exports = {
	content: [
		'./pages/**/*.{js,jsx,ts,tsx}',
		'./components/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				orange: '#ef7c17',
				darkblue: '#1c2532',
			},
			typography: {
				DEFAULT: {
					css: {
						// color: '#ff0',
						'--tw-prose-invert-headings': 'text-gray-200',
					},
				},
			},
			borderWidth: {
				1: '1px',
			},
			boxShadow: {
				link: 'inset 0 -2px 0 0 #ef7c17',
				linkhover: 'inset 0 -1.6em 0 0 #ef7c17',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
}
