import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/projects/github-stars/utils/tailwindMerge';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/** `className` applies to the wrapper (e.g. width). */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
	const { className, children, ...rest } = props;

	return (
		<div className={cn('grid grid-cols-1', className)}>
			<select
				ref={ref}
				className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orange disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus-visible:outline-orange"
				{...rest}
			>
				{children}
			</select>
			<ChevronDown
				aria-hidden="true"
				className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
			/>
		</div>
	);
});
Select.displayName = 'Select';

export { Select };
