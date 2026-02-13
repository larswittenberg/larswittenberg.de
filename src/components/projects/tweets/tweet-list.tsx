import { Tweet } from '@/types/tweet';
import { TweetItem } from './tweet-item';

interface TweetListProps {
	tweets: Tweet[];
	query: string;
}

export const TweetList = ({ tweets, query }: TweetListProps) => {
	if (tweets.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center dark:border-gray-700 dark:bg-gray-800">
				<p className="text-gray-500 dark:text-gray-400">Keine Tweets gefunden.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{tweets.map((tweet) => (
				<TweetItem key={tweet.id} tweet={tweet} query={query} />
			))}
		</div>
	);
};
