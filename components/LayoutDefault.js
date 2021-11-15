import Header from './Header'
import Footer from './Footer'

export default function LayoutDefault({ className, children }) {
	return (
		<div>
			<Header className="" />
			<main className={`mx-4 lg:mx-auto max-w-prose text-2xl ${className}`}>
				{children}
			</main>
			<Footer />
		</div>
	)
}
