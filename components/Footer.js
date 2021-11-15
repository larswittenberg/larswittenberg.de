import NextLink from 'next/link'

export default function Footer() {
	return (
		<footer className="lg:w-2/3 mt-16 mx-4 lg:mx-auto py-8 border-t border-solid border-gray-700 text-center">
			<div>
				<p className="text-base text-gray-500">
					© {new Date().getFullYear()} Lars Wittenberg
					{' '}·{' '}
					Built with <a href="https://nextjs.org/" className="underline">next.js</a>
					{' '}·{' '}
					Deployed on <a href="https://vercel.com/" className="underline">vercel.com</a>
					{' '}·{' '}
					<NextLink href="/impressum" passHref><a className="underline">Impressum</a></NextLink>
				</p>
			</div>
		</footer>
	)
}
