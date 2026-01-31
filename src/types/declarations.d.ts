declare module '*.css' {
	const content: { [className: string]: string };
	export default content;
}

declare module '*.mdx' {
	import type { ComponentType } from 'react';
	const component: ComponentType<any>;
	export default component;
	export const ContentMetadata: any;
}
