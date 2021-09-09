import NextLink from 'next/link'

export default function Footer() {
	return (
		<footer className="lg:w-2/3 mt-16 mx-4 lg:mx-auto py-8 border-t border-solid border-gray-600 text-center">
			<div>
				<p>
					© {new Date().getFullYear()} Lars Wittenberg
					{' '}·{' '}
					Built with <a href="https://nextjs.org/">next.js</a>
					{' '}·{' '}
					Deployed on <a href="https://vercel.com/">vercel.com</a>
					{' '}·{' '}
					<NextLink href="/impressum" passHref><a>Impressum</a></NextLink>
				</p>
			</div>
		</footer>
	)
}
