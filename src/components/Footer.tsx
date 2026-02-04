import Link from 'next/link';
import cn from 'classnames';

export default function Footer() {
	let linkClass = cn({
		'border-b-1 hover:border-b-2 border-gray-500 transition-all': true,
	});

	return (
		<footer className="mx-4 mt-16 border-t border-solid border-gray-700 py-8 text-center md:mx-10 lg:mx-auto lg:w-11/12">
			<div>
				<p className="text-base text-gray-600 dark:text-gray-400">
					© {new Date().getFullYear()} Lars Wittenberg · Built with{' '}
					<Link href="https://nextjs.org/" className={linkClass}>
						next.js 16
					</Link>{' '}
					· Deployed on{' '}
					<Link href="https://vercel.com/" className={linkClass}>
						vercel.com
					</Link>{' '}
					·{' '}
					<Link href="/impressum" className={linkClass}>
						Impressum
					</Link>
				</p>
			</div>
		</footer>
	);
}
