import NextLink from 'next/link'
import cn from 'classnames'

export default function Footer() {
	let linkClass = cn({
		'border-b-1 hover:border-b-2 border-gray-500 transition-all': true,
	})

	return (
		<footer className="lg:w-11/12 mt-16 mx-4 md:mx-10 lg:mx-auto py-8 border-t border-solid border-gray-700 text-center">
			<div>
				<p className="text-base text-gray-400">
					© {new Date().getFullYear()} Lars Wittenberg · Built with{' '}
					<a href="https://nextjs.org/" className={linkClass}>
						next.js
					</a>{' '}
					· Deployed on{' '}
					<a href="https://vercel.com/" className={linkClass}>
						vercel.com
					</a>{' '}
					·{' '}
					<NextLink href="/impressum" passHref>
						<a className={linkClass}>Impressum</a>
					</NextLink>
				</p>
			</div>
		</footer>
	)
}
