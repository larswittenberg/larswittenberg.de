import * as React from 'react';
import { cn } from '@/lib/projects/github-stars/utils/tailwindMerge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: 'default' | 'outline';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
	const { className, variant = 'default', ...rest } = props;
	return (
		<span
			ref={ref}
			className={cn(
				'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
				variant === 'default' && 'bg-secondary text-secondary-foreground border-transparent',
				variant === 'outline' && 'border-border text-muted-foreground',
				className,
			)}
			{...rest}
		/>
	);
});
Badge.displayName = 'Badge';
