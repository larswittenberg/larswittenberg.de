import Header from './Header'
import Footer from './Footer'

export default function LayoutDefault({ className, children }) {
	return (
		<div className="min-h-screen flex flex-col">
			<Header className="" />
			<main className={`flex-grow mx-4 lg:mx-auto max-w-prose text-2xl ${className}`}>
				{children}
			</main>
			<Footer />
		</div>
	)
}
