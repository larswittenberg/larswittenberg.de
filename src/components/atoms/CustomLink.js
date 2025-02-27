import Link from 'next/link';

export default function CustomLink({ href, children, ...props }) {
	if (href?.startsWith('/')) {
		return (
			<Link href={href} className="link" {...props}>
				{children}
			</Link>
		);
	}
	if (href?.startsWith('#')) {
		return (
			<a href={href} className="link" {...props}>
				{children}
			</a>
		);
	}
	return (
		<a href={href} target="_blank" rel="noopener noreferrer" className="link" {...props}>
			{children}
		</a>
	);
}
