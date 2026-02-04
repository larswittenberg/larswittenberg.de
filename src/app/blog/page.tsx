import { Metadata } from 'next';
import Link from 'next/link';
import LayoutDefault from '@/components/LayoutDefault';
import { getBlogPosts } from '@/lib/mdx-utils';

export const metadata: Metadata = {
	title: 'Blog',
};

export default async function BlogPage() {
	const posts = getBlogPosts();
	const filteredBlogPosts = posts.filter((post) => post.metadata.draft === false);
	filteredBlogPosts.sort((a, b) => Number(new Date(b.metadata.date)) - Number(new Date(a.metadata.date)));

	return (
		<LayoutDefault prose>
			<section>
				<h1>Blog-Artikel</h1>

				<div className="not-prose">
					<ul className="list-none">
						{filteredBlogPosts.map((post) => (
							<li key={post.slug} className="mb-16 pl-0">
								{post.metadata.date && (
									<p className="mt-0 mb-2 text-base">
										{new Intl.DateTimeFormat('de-DE', {
											year: 'numeric',
											month: 'long',
											day: '2-digit',
										}).format(Date.parse(post.metadata.date))}
									</p>
								)}
								<h2 className="mb-2 text-2xl font-bold md:text-3xl lg:text-4xl xl:text-5xl xl:leading-tight">
									<Link href={`/blog/${post.slug}`} className="link">
										{post.metadata.title}
									</Link>
								</h2>
							</li>
						))}
					</ul>
				</div>
			</section>
		</LayoutDefault>
	);
}
