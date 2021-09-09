import Link from 'next/link'

export default function Header() {
	return (
		<nav>
			<ul className="flex items-center justify-between p-8">
				<li>
					<Link href="/">
						<a className="no-underline text-accent-1 dark:text-gray-300">Project Website</a>
					</Link>
				</li>
				<ul className="flex items-center justify-between space-x-4">
					<li>
						<a href="https://github.com/larswittenberg/nextjs-tailwindcss-kickstarter" className="no-underline dark:text-gray-300">
							GitHub
						</a>
					</li>
				</ul>
			</ul>
		</nav>
	)
}
