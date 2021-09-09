const title = 'Next.js + Tailwind CSS Kickstarter'
const description = 'Basic template setup with Next.js + Tailwind CSS and some helpers.'
const url = 'https://nextjs-tailwindcss-kickstarter.vercel.app/'

export default {
	title,
	description,
	canonical: url,
	openGraph: {
		type: 'website',
		locale: 'en_GB',
		url: url,
		title,
		description,
	},
		twitter: {
		handle: '@larswittenberg',
		site: '@larswittenberg',
		cardType: 'summary_large_image',
	},
};
