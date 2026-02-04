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
				src={`/twitter-data/media/${props.src}`}
				alt={props.alt || ''}
				style={{ width: '100%', height: 'auto' }}
				// {...(props as ImageProps)}
			/>
		);
	},
} satisfies MDXComponents;

export const mdxComponentsForTweets = componentsForTweets;
