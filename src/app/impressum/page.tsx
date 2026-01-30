import type { Metadata } from 'next';
import { mdxComponents } from '@/mdx-components';
import LayoutDefault from '@/components/LayoutDefault';
import MdxContent, { ContentMetadata } from './impressum.mdx';

export const metadata: Metadata = {
	title: ContentMetadata.title,
};

export default async function Page() {
	return (
		<LayoutDefault prose>
			<article>
				<MdxContent components={mdxComponents} />
			</article>
		</LayoutDefault>
	);
}
