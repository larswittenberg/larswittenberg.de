import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import CustomFigure from '@/components/atoms/CustomFigure'

// const components: MDXComponents = {}

const components = {
	// Allows customizing built-in components, e.g. to add styling.
	h1: ({ children }) => (
		<h1 style={{ color: 'red', fontSize: '48px' }}>{children}</h1>
	),
	img: (props) => (
		<Image
		sizes="100vw"
		style={{ width: '100%', height: 'auto' }}
		{...(props as ImageProps)}
		/>
	),
	Figure: CustomFigure,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
	return components;
}
