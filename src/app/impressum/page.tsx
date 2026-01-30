import type { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';
import ContentImpressum from './impressum.mdx';

export const metadata: Metadata = {
	title: 'Impressum',
};

export default async function Page() {
	return (
		<LayoutDefault prose>
			<article>
				<ContentImpressum />
			</article>
		</LayoutDefault>
	);
}
