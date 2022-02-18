import NextLink from 'next/link'

export default function Header({ className }) {

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/blog', label: 'Blog' },
	]

	return (
		<header className={`lg:w-11/12 mx-4 lg:mx-auto lg:my-12 ${className}`}>
			<nav>
				<ul className="flex items-center justify-between py-8">
					<li>
						<NextLink href="/">
							<a className="font-medium text-2xl py-1 px-6 tracking-wider font-mono">
								&lt;larswittenberg.de /&gt;
							</a>
						</NextLink>
					</li>
					<li>
						<ul className="m-auto flex flex-wrap items-center justify-between">
						{links.map(({ href, label }) => (
							<li key={`${href}${label}`}>
								<NextLink href={href} passHref>
									<a className="font-bold text-xl py-1 px-6 tracking-wider">{label}</a>
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
