const title = 'Lars Wittenberg - Frontend Web Developer aus Stuttgart';
const description = 'Frontend Web Developer. Pixelschubser. Coder. Nerd. Fahrradfahrer. Aus Stuttgart.';

const SEO = {
	title,
	description,
	canonical: 'https://larswittenberg.de/',
	openGraph: {
		type: 'website',
		locale: 'de_DE',
		url: 'https://larswittenberg.de/',
		title,
		description,
		images: [{
			url: 'https://larswittenberg.de/images/opengraph.png',
			alt: title,
			width: 1200,
			height: 628
		}]
	},
	twitter: {
		handle: '@larswittenberg',
		site: '@larswittenberg',
		cardType: 'summary_large_image',
	},
};

export default SEO;
