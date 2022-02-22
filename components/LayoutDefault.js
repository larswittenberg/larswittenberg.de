import cn from 'classnames'
import Header from './Header'
import Footer from './Footer'

export default function LayoutDefault({
	children,
	fullWidth,
	centerVertical,
	prose,
}) {
	let ClassNames = cn({
		'flex-grow mx-4 md:mx-10 lg:mx-auto': true,
		'prose dark:prose-invert  lg:prose-lg xl:prose-xl 2xl:prose-2xl mx-auto':
			prose,
		'lg:w-11/12 lg:mx-auto': fullWidth,
		'max-w-prose': !fullWidth,
		'flex items-center': centerVertical,
	})

	return (
		<div className="layoutwrapper flex flex-col">
			<Header />
			<main className={ClassNames}>{children}</main>
			<Footer />
		</div>
	)
}
