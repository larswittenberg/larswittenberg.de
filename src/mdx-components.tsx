import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import CustomFigure from '@/components/atoms/CustomFigure';
import FlexWrapper from '@/components/atoms/FlexWrapper';

// const components: MDXComponents = {}

const components = {
	// Allows customizing built-in components, e.g. to add styling.
	h1: ({ children }) => (
		<h1 className='title font-semibold text-2xl tracking-tighter'>{children}</h1>
	),
	img: (props) => (
		<Image
		sizes="100vw"
		style={{ width: '100%', height: 'auto' }}
		{...(props as ImageProps)}
		/>
	),
	Image,
	Figure: CustomFigure,
	FlexWrapper,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
	return components;
}
