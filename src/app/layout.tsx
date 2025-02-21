import React from 'react';
import type { Metadata } from 'next';
import '@/styles/main.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
	title: 'Next.js + Tailwind CSS Kickstarter',
	description: 'Basic template setup with Next.js + Tailwind CSS and some helpers.',
	icons: {
		icon: '/favicon.svg',
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
			</body>
		</html>
	);
}
