import type { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';
import { TweetSearchPage } from '@/components/projects/tweets/tweet-search-page';

export const metadata: Metadata = {
	title: 'Tweet Suche',
	description: 'Durchsuche mein gesamtes Twitter Archiv nach Stichworten und finde alte Beiträge wieder.',
};

export default function Page() {
	return (
		<LayoutDefault prose fullWidth>
			<h1>Mein twitter Archiv</h1>
			<TweetSearchPage />
		</LayoutDefault>

		// <LayoutDefault prose>
		// 	<div className="py-8">
		// 		<header className="mb-8 text-center">
		// 			<h1 className="mb-4 text-3xl font-bold">Tweet Suche</h1>
		// 			<p className="text-gray-600 dark:text-gray-400">
		// 				Finde Beiträge aus über einem Jahrzehnt Twitter-Geschichte.
		// 			</p>
		// 		</header>
		// 		<TweetSearchPage />
		// 	</div>
		// </LayoutDefault>
	);
}
