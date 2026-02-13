import { Tweet } from '@/types/tweet';
import React from 'react';
import Image from 'next/image';

interface TweetItemProps {
	tweet: Tweet;
	query: string;
}

const highlightText = (text: string, query: string) => {
	if (!query || query.length < 2) return text;

	try {
		// Escape special regex chars
		const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
		return parts.map((part, i) =>
			part.toLowerCase() === query.toLowerCase() ? (
				<mark key={i} className="rounded-sm bg-yellow-200 px-0.5 dark:bg-yellow-800 dark:text-white">
					{part}
				</mark>
			) : (
				part
			),
		);
	} catch {
		return text;
	}
};

const unescapeMarkdown = (text: string) => {
	return text.replace(/\\(.)/g, '$1');
};

const renderLine = (line: string, key: string | number, query: string) => {
	// Find Images ! [alt](src), Markdown Links [text](url) and plain URLs
	// The regex now includes the optional ! for images
	const parts = line.split(/(!?\[.*?\]\(.*?\)|https?:\/\/[^\s]+)/g);

	return (
		<p key={key} className="mb-2 text-base wrap-break-word last:mb-0">
			{parts.map((part, i) => {
				// Image: ![alt](src)
				const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
				if (imgMatch) {
					return (
						<span key={i} className="my-4 block">
							<Image
								width="600"
								height="450"
								sizes="100vw"
								src={`/projekte/twitter-media/${imgMatch[2]}`}
								alt={unescapeMarkdown(imgMatch[1]) || ''}
								style={{ width: '50%', height: 'auto' }}
								className="rounded-lg"
							/>
						</span>
					);
				}

				// Markdown link: [text](url)
				const mdLinkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
				if (mdLinkMatch) {
					return (
						<a
							key={i}
							href={unescapeMarkdown(mdLinkMatch[2])}
							target="_blank"
							rel="noopener noreferrer"
							className="shadow-none! hover:shadow-linkhover! hover:text-darkblue!"
						>
							{highlightText(unescapeMarkdown(mdLinkMatch[1]), query)}
						</a>
					);
				}

				// Plain URL
				if (part.match(/^https?:\/\//)) {
					const unescapedUrl = unescapeMarkdown(part);
					return (
						<a
							key={i}
							href={unescapedUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="shadow-none! hover:shadow-linkhover! hover:text-darkblue!"
						>
							{unescapedUrl}
						</a>
					);
				}

				return (
					<span key={i} className="wrap-break-word">
						{highlightText(unescapeMarkdown(part), query)}
					</span>
				);
			})}
		</p>
	);
};

// Simple markdown renderer for links, blockquotes, images and videos
const renderContent = (content: string, query: string) => {
	const lines = content.split('\n');
	const renderedElements: React.ReactNode[] = [];

	let currentBlockquote: React.ReactNode[] = [];

	const flushBlockquote = (key: string | number) => {
		if (currentBlockquote.length > 0) {
			renderedElements.push(
				<blockquote
					key={`bq-${key}`}
					className="not-prose text-tw-prose-quotes my-4 border-l-4 border-gray-300 pl-4 italic"
				>
					{[...currentBlockquote]}
				</blockquote>,
			);
			currentBlockquote = [];
		}
	};

	lines.forEach((line, lineIndex) => {
		const trimmedLine = line.trim();

		// Handle Blockquotes
		if (trimmedLine.startsWith('>')) {
			const bqContent = trimmedLine.replace(/^>\s?/, '');
			currentBlockquote.push(renderLine(bqContent, `bq-line-${lineIndex}`, query));
			return;
		} else {
			flushBlockquote(lineIndex);
		}

		// if (!trimmedLine) {
		//     renderedElements.push(<br key={`br-${lineIndex}`} />);
		//     return;
		// }

		// Handle Images: ![](image.jpg)
		const imgMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)$/);
		if (imgMatch) {
			renderedElements.push(
				<div key={`img-${lineIndex}`} className="my-4">
					<Image
						width="600"
						height="450"
						sizes="100vw"
						src={`/projekte/twitter-media/${imgMatch[2]}`}
						alt={unescapeMarkdown(imgMatch[1]) || ''}
						style={{ width: '50%', height: 'auto' }}
						className="rounded-lg"
					/>
				</div>,
			);
			return;
		}

		// Handle Videos: <Video src="video.mp4" />
		const videoMatch = trimmedLine.match(/<Video\s+src="(.*?)"\s*\/>/);
		if (videoMatch) {
			renderedElements.push(
				<div key={`video-${lineIndex}`} className="my-4">
					<video controls style={{ width: '50%', height: 'auto' }} className="aspect-video rounded-lg">
						<source src={`/projekte/twitter-media/${videoMatch[1]}`} />
					</video>
				</div>,
			);
			return;
		}

		// Default: Render as paragraph
		renderedElements.push(renderLine(trimmedLine, lineIndex, query));
	});

	flushBlockquote('end');

	return renderedElements;
};

export const TweetItem = ({ tweet, query }: TweetItemProps) => {
	return (
		<article className="border-b border-gray-500 py-8 last:border-0">
			<div className="max-w-none text-base leading-relaxed text-gray-800 dark:text-gray-200">
				{renderContent(tweet.content, query)}

				<p className="mt-4 text-base wrap-break-word">
					<a
						href={tweet.url}
						target="_blank"
						rel="noopener noreferrer"
						className="shadow-none! hover:shadow-linkhover! hover:text-darkblue!"
					>
						{tweet.date}
					</a>
				</p>
			</div>
		</article>
	);
};
