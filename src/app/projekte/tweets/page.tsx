import type { Metadata } from 'next';
import { mdxComponentsForTweets } from '@/mdx-components';
import LayoutDefault from '@/components/LayoutDefault';
import MdxContent from './tweets-2023.mdx';

export const metadata: Metadata = {
	title: 'tweets',
};

export default async function Page() {
	return (
		<LayoutDefault prose>
			<article>
				<MdxContent components={mdxComponentsForTweets} />
			</article>
		</LayoutDefault>
	);
}
