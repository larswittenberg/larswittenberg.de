import NextLink from 'next/link'

export default function Header({ className }) {

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/blog', label: 'Blog' },
	]

	return (
		<header className={`lg:w-2/3 mx-4 lg:mx-auto lg:mt-16 lg:mb-12 ${className}`}>
			<nav>
				<ul className="flex items-center justify-between py-8">
					<li>
						<NextLink href="/">
							<a className="no-underline font-bold text-xl py-1 px-6 tracking-wider">larswittenberg.de</a>
						</NextLink>
					</li>
					<li>
						<ul className="m-auto flex flex-wrap items-center justify-between">
						{links.map(({ href, label }) => (
							<li key={`${href}${label}`}>
								<NextLink href={href} passHref>
									<a className="no-underline font-bold text-xl py-1 px-6 tracking-wider">{label}</a>
								</NextLink>
							</li>
						))}
						</ul>
					</li>
				</ul>
			</nav>
		</header>
	)
}
