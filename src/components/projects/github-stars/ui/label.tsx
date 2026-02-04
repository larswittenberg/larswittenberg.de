import * as React from 'react';
import { cn } from '@/lib/projects/github-stars/utils/tailwindMerge';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>((props, ref) => {
	const { className, ...rest } = props;

	return (
		<label
			ref={ref}
			className={cn(
				'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
				className,
			)}
			{...rest}
		/>
	);
});
Label.displayName = 'Label';

export { Label };
