import Header from './Header'
import Footer from './Footer'

export default function LayoutDefault({ className, children }) {
	return (
		<div>
			<Header />
			<main className="lg:w-2/3 mx-4 lg:mx-auto">
				{children}
			</main>
			<Footer />
		</div>
	)
}
