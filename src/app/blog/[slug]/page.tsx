import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import LayoutDefault from '@/components/LayoutDefault';
import { mdxComponents } from '@/mdx-components';

// Interfaces
interface Frontmatter {
	title: string;
	date: string;
	draft?: boolean;
	desc?: string;
	[key: string]: any;
}

interface Props {
	params: Promise<{ slug: string }>;
}

// Helper to get post
async function getPost(slug: string) {
	const postsDirectory = path.join(process.cwd(), 'src/app/blog/blogposts');
	const filePath = path.join(postsDirectory, `${slug}.mdx`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const fileContents = fs.readFileSync(filePath, 'utf8');
	const { content, data } = matter(fileContents);

	return {
		content,
		frontMatter: data as Frontmatter,
	};
}

// Generate Metadata
export async function generateMetadata(props: Props): Promise<Metadata> {
	const params = await props.params;

	const { slug } = params;

	const post = await getPost(slug);

	if (!post) {
		return {};
	}

	return {
		title: post.frontMatter.title,
		description: post.frontMatter.desc,
	};
}

// Generate Static Params
export async function generateStaticParams() {
	const postsDirectory = path.join(process.cwd(), 'src/app/blog/blogposts');
	const filenames = fs.readdirSync(postsDirectory);

	return filenames
		.filter((filename) => /\.mdx?$/.test(filename))
		.map((filename) => ({
			slug: filename.replace(/\.mdx?$/, ''),
		}));
}

export default async function PostPage(props: Props) {
	const params = await props.params;

	const { slug } = params;

	const post = await getPost(slug);

	if (!post) {
		notFound();
	}

	return (
		<LayoutDefault prose>
			<article>
				<p className="not-prose mt-0 mb-1 text-base">
					Datum:{' '}
					{new Intl.DateTimeFormat('de-DE', {
						year: 'numeric',
						month: 'long',
						day: '2-digit',
					}).format(Date.parse(post.frontMatter.date))}
				</p>
				<h1 className="mb-12">{post.frontMatter.title}</h1>

				<MDXRemote source={post.content} components={mdxComponents} />
			</article>
		</LayoutDefault>
	);
}
