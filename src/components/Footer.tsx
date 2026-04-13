import Link from 'next/link';
import cn from 'classnames';
import packageJson from '../../package.json';
import { formatDate } from '@/lib/utils';

export default function Footer() {
	const currentYear = new Date().getFullYear();
	const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE;
	const nextVersion = packageJson.dependencies.next;

	let linkClass = cn({
		'border-b-1 hover:border-b-2 border-gray-500 transition-all': true,
	});

	return (
		<footer className="mx-4 mt-16 border-t border-solid border-gray-700 py-8 text-center md:mx-10 lg:mx-auto lg:w-11/12">
			<div>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					© {currentYear} Lars Wittenberg · Built with{' '}
					<Link href="https://nextjs.org/" className={linkClass}>
						next.js {nextVersion}
					</Link>{' '}
					· Deployed on{' '}
					<Link href="https://vercel.com/" className={linkClass}>
						vercel.com
					</Link> on {buildDate ? formatDate(buildDate) : 'unknown'}{' '}
					·{' '}
					<Link href="/impressum" className={linkClass}>
						Impressum
					</Link>
				</p>
			</div>
		</footer>
	);
}
