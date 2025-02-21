import '../styles/main.css'
import { DefaultSeo } from 'next-seo'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import SEO from '../../next-seo.config'

export default function App({ Component, pageProps }) {
	return (
		<>
			{/* Here we call NextSeo and pass our default configuration to it */}
			<DefaultSeo {...SEO} />
			<Component {...pageProps} />
			<Analytics />
			<SpeedInsights />
		</>
	)
}
