import cn from 'classnames'
import Header from './Header'
import Footer from './Footer'

export default function LayoutDefault({ children, fullWidth, centerVertical }) {
	let ClassNames = cn({
		'flex-grow mx-4 lg:mx-auto text-2xl': true,
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
