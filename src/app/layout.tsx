import React from 'react';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/styles/main.css';

const title = 'Lars Wittenberg - Frontend Web Developer aus Stuttgart';
const description = 'Frontend Web Developer. Pixelschubser. Coder. Nerd. Fahrradfahrer. Aus Stuttgart.';

export const metadata: Metadata = {
	title: {
		template: '%s | Lars Wittenberg',
		default: title, // a default is required when creating a template
	},
	description,
	icons: {
		icon: '/favicon.svg',
	},
	openGraph: {
		type: 'website',
		locale: 'de_DE',
		url: 'https://larswittenberg.de/',
		title,
		description,
		images: [
			{
				url: 'https://larswittenberg.de/images/opengraph.png',
				alt: title,
				width: 1200,
				height: 628,
			},
		],
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="de" className="bg-orange">
			<body className="border-orange border-8 border-solid">
				{children}

				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
