'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useDebounce } from '@/lib/projects/github-stars/utils/use-debounce';
import { Tweet } from '@/types/tweet';
import { TweetList } from './tweet-list';

const PAGE_SIZE = 20;

export const TweetSearchPage = () => {
	const [tweets, setTweets] = useState<Tweet[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

	const debouncedQuery = useDebounce(query, 300);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		const fetchTweets = async () => {
			try {
				const res = await fetch('/tweets-search.json');
				if (!res.ok) throw new Error('Fehler beim Laden der Tweets');
				const data = await res.json();
				setTweets(data);
				setLoading(false);
			} catch (err) {
				console.error(err);
				setError('Tweets konnten nicht geladen werden.');
				setLoading(false);
			}
		};

		fetchTweets();
	}, []);

	const filteredTweets = useMemo(() => {
		if (!debouncedQuery) return tweets;
		const lowerQuery = debouncedQuery.toLowerCase();
		return tweets.filter((t) => t.search_text.includes(lowerQuery));
	}, [tweets, debouncedQuery]);

	const displayedTweets = useMemo(() => {
		return filteredTweets.slice(0, displayCount);
	}, [filteredTweets, displayCount]);

	useEffect(() => {
		setDisplayCount(PAGE_SIZE);
	}, [debouncedQuery]);

	const handleLoadMore = () => {
		startTransition(() => {
			setDisplayCount((prev) => prev + PAGE_SIZE);
		});
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
				<span className="ml-3 text-gray-500">Lade Archiv...</span>
			</div>
		);
	}

	if (error) {
		return <div className="py-10 text-center text-red-500">{error}</div>;
	}

	return (
		<div className="space-y-8">
			<div className="relative max-w-xl">
				<p>
					Volltext-Suche über meine {new Intl.NumberFormat('de-DE').format(tweets.length)} tweets von 2009-2023.
				</p>
				{/* <div className="mt-2 text-xs text-gray-400">
					{tweets.length > 0 &&
						`Durchsuche ${new Intl.NumberFormat('de-DE').format(tweets.length)} Tweets aus den Jahren 2009-2023`}
				</div> */}

				<div className="relative">
					<input
						type="search"
						placeholder="Suche im twitter Archiv..."
						className="w-full rounded-full border px-5 py-3 pl-12 text-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					<svg
						className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					{query && (
						<div className="absolute top-1/2 right-4 -translate-y-1/2 bg-white px-2 text-sm text-gray-400 dark:bg-gray-800">
							{filteredTweets.length} Treffer
						</div>
					)}
				</div>
			</div>

			<TweetList tweets={displayedTweets} query={debouncedQuery} />

			{displayedTweets.length < filteredTweets.length && (
				<div className="py-8 text-center">
					<button
						onClick={handleLoadMore}
						disabled={isPending}
						className="rounded-full border border-gray-300 bg-white px-8 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						{isPending ? 'Lädt...' : 'Mehr Tweets laden'}
					</button>
					<div className="mt-2 text-xs text-gray-400">
						Zeige {displayedTweets.length} von {filteredTweets.length}
					</div>
				</div>
			)}
		</div>
	);
};
