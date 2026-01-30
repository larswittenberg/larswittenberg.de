import React from 'react';
import type { Metadata } from 'next';
import '@/styles/main.css';

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
	title: 'Next.js + Tailwind CSS Kickstarter',
	description: 'Basic template setup with Next.js + Tailwind CSS and some helpers.',
	icons: {
		icon: '/favicon.svg',
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="de" className="bg-orange">
			<body className="border-8 border-solid border-orange">
				{children}

				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
