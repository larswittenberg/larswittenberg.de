import cn from 'classnames';

export default function LayoutDefault({
	children,
	fullWidth,
	centerVertical,
	prose,
}: {
	children: React.ReactNode;
	fullWidth?: boolean;
	centerVertical?: boolean;
	prose?: boolean;
}) {
	let ClassNames = cn({
		'grow mx-4 md:mx-10 lg:mx-auto': true,
		'prose dark:prose-invert  lg:prose-lg xl:prose-xl 2xl:prose-2xl mx-auto': prose,
		'lg:w-11/12 lg:mx-auto': fullWidth,
		'max-w-prose': !fullWidth,
		'flex items-center': centerVertical,
	});

	return (
		<div className="layoutwrapper flex flex-col">
			<section className={ClassNames}>{children}</section>
		</div>
	);
}
