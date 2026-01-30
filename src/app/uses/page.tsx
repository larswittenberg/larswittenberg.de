import type { Metadata } from 'next';
import { formatDate } from '@/utils/mdx-utils'
import { useMDXComponents as getMDXComponents } from '@/mdx-components';
import LayoutDefault from '@/components/LayoutDefault';
import ContentUses, { ContentMetadata } from './uses.mdx';

export const metadata: Metadata = {
	title: ContentMetadata.title,
	description: ContentMetadata.desc,
};

export default async function Page() {
	const mdxComponents = getMDXComponents();

	return (
		<LayoutDefault prose>
			<article>
				<h1 className="title font-semibold text-2xl tracking-tighter">
					{ContentMetadata.title}
				</h1>
				<p className="text-base mb-12">
					Veröffentlich am:{' '}{formatDate(ContentMetadata.date || '')}
					{ContentMetadata.update && ` // Letztes Update: ${formatDate(ContentMetadata.update || '')}`}
				</p>

				<ContentUses components={mdxComponents} />
			</article>
		</LayoutDefault>
	);
}
