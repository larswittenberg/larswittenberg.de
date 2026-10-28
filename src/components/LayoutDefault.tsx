import { ReactNode } from 'react';
import cn from 'classnames';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LayoutDefault({
	children,
	fullWidth,
	centerVertical,
	prose,
	wide,
}: {
	children: ReactNode;
	fullWidth?: boolean;
	centerVertical?: boolean;
	prose?: boolean;
	/** Same width and margins as the header; overrides the prose max-width. */
	wide?: boolean;
}) {
	let ClassNames = cn({
		grow: true,
		'mx-4 md:mx-10 md:mx-auto lg:w-full': !wide,
		'mx-4 lg:mx-auto lg:w-11/12 max-w-none': wide,
		'prose dark:prose-invert lg:prose-lg xl:prose-xl 2xl:prose-2xl': prose,
		'lg:w-11/12 lg:mx-auto': fullWidth,
		'max-w-prose': !fullWidth && !prose && !wide,
		'flex items-center': centerVertical,
	});

	return (
		<div className="layoutwrapper flex flex-col">
			<Header />
			<main className={ClassNames}>{children}</main>
			<Footer />
		</div>
	);
}
