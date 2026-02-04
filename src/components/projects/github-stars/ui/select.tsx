import * as React from 'react';
import { cn } from '@/lib/projects/github-stars/utils/tailwindMerge';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
	const { className, children, ...rest } = props;

	return (
		<select
			ref={ref}
			className={cn(
				'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...rest}
		>
			{children}
		</select>
	);
});
Select.displayName = 'Select';

export { Select };
