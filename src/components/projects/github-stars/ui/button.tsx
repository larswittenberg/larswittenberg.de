import * as React from 'react';
import { cn } from '@/lib/projects/github-stars/utils/tailwindMerge';

type Variant = 'default' | 'secondary' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
	default: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
	secondary: 'bg-muted text-muted-foreground hover:bg-muted/80 focus-visible:ring-muted-foreground',
	outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const { className, variant = 'default', type = 'button', ...rest } = props;

	return (
		<button
			type={type}
			ref={ref}
			className={cn(
				'focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
				variantClasses[variant],
				className,
			)}
			{...rest}
		/>
	);
});
Button.displayName = 'Button';

export { Button };
