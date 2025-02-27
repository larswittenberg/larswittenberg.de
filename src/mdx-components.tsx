// https://nextjs.org/docs/app/building-your-application/configuring/mdx
// Good to know: mdx-components.tsx is required to use MDX with App Router and will not work without it

import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import CustomFigure from '@/components/atoms/CustomFigure';
import CustomLink from '@/components/atoms/CustomLink';
import FlexWrapper from '@/components/atoms/FlexWrapper';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.
export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		// Allows customizing built-in components, e.g. to add styling.
		// h1: ({ children }) => <h1 style={{ color: 'red', fontSize: '48px' }}>{children}</h1>,
		img: (props) => <Image sizes="100vw" style={{ width: '100%', height: 'auto' }} {...(props as ImageProps)} />,

		Figure: CustomFigure,
		FlexWrapper,
		a: CustomLink,
		...components,
	};
}
