import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import LayoutDefault from '@/components/LayoutDefault';
import { mdxComponentsForTweets } from '@/mdx-components';

interface Props {
	params: Promise<{ slug: string }>;
}

// Helper to get tweets per year
async function getTweetsPerYear(slug: string) {
	const tweetsDirectory = path.join(process.cwd(), 'src/app/projekte/tweets/archive');
	const filePath = path.join(tweetsDirectory, `${slug}.mdx`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const fileContents = fs.readFileSync(filePath, 'utf8');
	const { content } = matter(fileContents);

	return {
		content,
	};
}

// Generate Metadata
export async function generateMetadata(props: Props): Promise<Metadata> {
	const params = await props.params;
	const { slug } = params;
	const tweetsPerYear = await getTweetsPerYear(slug);

	if (!tweetsPerYear) {
		return {};
	}

	return {
		title: `Mein twitter Archiv ${slug.replace(/tweets-/g, '')}`,
	};
}

// Generate Static Params
export async function generateStaticParams() {
	const tweetsDirectory = path.join(process.cwd(), 'src/app/projekte/tweets/archive');
	const filenames = fs.readdirSync(tweetsDirectory);

	return filenames
		.filter((filename) => /\.mdx?$/.test(filename))
		.map((filename) => ({
			slug: filename.replace(/\.mdx?$/, ''),
		}));
}

export default async function TweetsPerYearPage(props: Props) {
	const params = await props.params;
	const { slug } = params;
	const tweetsPerYear = await getTweetsPerYear(slug);

	if (!tweetsPerYear) {
		notFound();
	}

	return (
		<LayoutDefault prose>
			<article>
				<h1 className="mb-12">{`Mein twitter Archiv ${slug.replace(/tweets-/g, '')}`}</h1>
				<Link href="/projekte/tweets" className="mb-8 inline-block hover:underline">
					&larr; Zurück zur Übersicht
				</Link>

				<MDXRemote source={tweetsPerYear.content} components={mdxComponentsForTweets} />
			</article>
		</LayoutDefault>
	);
}
