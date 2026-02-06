import Link from 'next/link';

export default function Header({ className }: { className?: string }) {
	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/projekte', label: 'Projekte' },
		{ href: '/blog', label: 'Blog' },
	];

	return (
		<header className={`mx-4 lg:mx-auto lg:my-12 lg:w-11/12 ${className}`}>
			<nav>
				<ul className="flex flex-col items-center justify-between py-8 lg:flex-row">
					<li>
						<Link
							href="/"
							className="px-4 py-1 font-mono text-xl font-medium tracking-wider sm:px-6 sm:text-2xl"
						>
							&lt;larswittenberg.de /&gt;
						</Link>
					</li>
					<li>
						<ul className="m-auto my-8 flex flex-wrap items-center justify-between lg:my-0">
							{links.map(({ href, label }) => (
								<li key={`${href}${label}`}>
									<Link
										href={href}
										className="hover:shadow-linkhover dark:hover:text-darkblue px-4 py-1 text-xl font-bold tracking-wider transition-all duration-150 ease-linear sm:px-6"
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
	);
}
