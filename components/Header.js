import Link from 'next/link'

export default function Header({ className }) {
	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/blog', label: 'Blog' },
	]

	return (
		<header className={`lg:w-11/12 mx-4 lg:mx-auto lg:my-12 ${className}`}>
			<nav>
				<ul className="flex flex-col md:flex-row items-center justify-between py-8">
					<li>
						<Link
							href="/"
							className="font-medium text-xl sm:text-2xl py-1 px-4 sm:px-6 tracking-wider font-mono"
						>
							&lt;larswittenberg.de /&gt;
						</Link>
					</li>
					<li>
						<ul className="my-8 lg:my-0 m-auto flex flex-wrap items-center justify-between">
							{links.map(({ href, label }) => (
								<li key={`${href}${label}`}>
									<Link
										href={href}
										className="font-bold text-xl py-1 px-4 sm:px-6 tracking-wider hover:shadow-linkhover hover:dark:text-darkblue transition-all duration-150 ease-linear"
									>
										{label}
									</Link>
								</li>
							))}
						</ul>
					</li>
				</ul>
			</nav>
		</header>
	)
}
