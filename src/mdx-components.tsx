import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import CustomFigure from '@/components/atoms/CustomFigure';
import FlexWrapper from '@/components/atoms/FlexWrapper';

// const components: MDXComponents = {}

const components = {
	// Allows customizing built-in components, e.g. to add styling.
	h1: ({ children }) => <h1 className="title text-2xl font-semibold tracking-tighter">{children}</h1>,
	img: (props) => <Image sizes="100vw" style={{ width: '100%', height: 'auto' }} {...(props as ImageProps)} />,
	Image,
	Figure: CustomFigure,
	FlexWrapper,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
	return components;
}

export const mdxComponents = components;

const componentsForTweets = {
	img: (props) => {
		return (
			<Image
				width="600"
				height="450"
				sizes="100vw"
				src={`/projekte/twitter-media/${props.src}`}
				alt={props.alt || ''}
				style={{ width: '50%', height: 'auto' }}
				// {...(props as ImageProps)}
			/>
		);
	},
	Video: (props) => {
		return (
			<video controls style={{ width: '50%', height: 'auto' }} className="aspect-video">
				<source src={`/projekte/twitter-media/${props.src}`} />
			</video>
		);
	},
	blockquote: (props) => {
		return (
			<blockquote className="not-prose border-l-4 border-gray-300 pl-4 italic text-tw-prose-quotes">
				{props.children}
			</blockquote>
		);
	},
	p: (props) => {
		return (<p className="text-base wrap-break-word" {...props} />);
	},
	a: (props) => {
		return (<a href={props.href} target="_blank" rel="noopener noreferrer" className="underline text-base">{props.children}</a>);
	},
	hr: (props) => {
		return (<hr className="my-8! border-t border-gray-500" {...props} />);
	}
} satisfies MDXComponents;

export const mdxComponentsForTweets = componentsForTweets;
