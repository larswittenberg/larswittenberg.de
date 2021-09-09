import NextLink from 'next/link'

export default function Header() {

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/blog', label: 'Blog' },
	]

	return (
		<nav>
			<ul className="flex items-center justify-between p-8">
				<li>
					<NextLink href="/">
						<a className="no-underline text-accent-1 dark:text-gray-300 py-1">larswittenberg.de</a>
					</NextLink>
				</li>
				<li>
					<ul className="m-auto flex flex-wrap items-center justify-between">
					{links.map(({ href, label }) => (
						<li key={`${href}${label}`}>
							<NextLink href={href} passHref>
								<a className="underline py-1 px-4">{label}</a>
							</NextLink>
						</li>
					))}
					</ul>
				</li>
			</ul>
		</nav>
	)
}
