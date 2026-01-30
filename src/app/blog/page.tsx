import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Metadata } from 'next';
import Link from 'next/link';
import LayoutDefault from '@/components/LayoutDefault';

export const metadata: Metadata = {
	title: 'Blog',
};

interface BlogPost {
	content: string;
	data: {
		title: string;
		date: string;
		draft?: boolean;
		[key: string]: any;
	};
	filePath: string;
}

async function getPosts(): Promise<BlogPost[]> {
	const postsDirectory = path.join(process.cwd(), 'src/app/blog/blogposts');
	const filenames = fs.readdirSync(postsDirectory);

	const posts = filenames
		.filter((filename) => /\.mdx?$/.test(filename))
		.map((filename) => {
			const filePath = path.join(postsDirectory, filename);
			const fileContents = fs.readFileSync(filePath, 'utf8');
			const { content, data } = matter(fileContents);

			return {
				content,
				data: data as BlogPost['data'],
				filePath: filename,
			};
		});

	return posts;
}

export default async function BlogPage() {
	const posts = await getPosts();
	const filteredBlogPosts = posts.filter((i) => i.data.draft === false);
	filteredBlogPosts.sort((a, b) => Number(new Date(b.data.date)) - Number(new Date(a.data.date)));

	return (
		<LayoutDefault prose>
			<section>
				<h1>Blog-Artikel</h1>

				<div className="not-prose">
					<ul className="list-none">
						{filteredBlogPosts.map((post) => (
							<li key={post.filePath} className="mb-16 pl-0">
								{post.data.date && (
									<p className="mt-0 mb-2 text-base">
										{new Intl.DateTimeFormat('de-DE', {
											year: 'numeric',
											month: 'long',
											day: '2-digit',
										}).format(Date.parse(post.data.date))}
									</p>
								)}
								<h2 className="mb-2 text-2xl font-bold md:text-3xl lg:text-4xl xl:text-5xl xl:leading-tight">
									<Link href={`/blog/${post.filePath.replace(/\.mdx?$/, '')}`} className="link">
										{post.data.title}
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
