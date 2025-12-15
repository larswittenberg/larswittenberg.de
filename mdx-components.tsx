// https://nextjs.org/docs/app/building-your-application/configuring/mdx
// Good to know: mdx-components.tsx is required to use MDX with App Router and will not work without it

import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		...components,
	};
}
