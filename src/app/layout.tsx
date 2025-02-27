import React from 'react';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@/styles/main.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
	title: {
		default: 'Lars Wittenberg - Frontend Web Developer aus Stuttgart',
		template: '%s | Lars Wittenberg - Frontend Web Developer aus Stuttgart',
	},
	description: 'Frontend Web Developer. Pixelschubser. Coder. Nerd. Fahrradfahrer. Aus Stuttgart.',
	icons: {
		icon: '/favicon.svg',
	},
	openGraph: {
		type: 'website',
		locale: 'de_DE',
		url: 'https://larswittenberg.de/',
		images: [
			{
				url: 'https://larswittenberg.de/images/opengraph.png',
				alt: 'Lars Wittenberg - Frontend Web Developer aus Stuttgart',
				width: 1200,
				height: 628,
			},
		],
	},
};

export default async function RootLayout(props: { children: React.ReactNode; }) {
	const { children } = props;

	return (
		<html lang="de">
			<body className="border-8 border-solid border-orange">
				<Header />
				<main className="">{children}</main>
				<Footer />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
