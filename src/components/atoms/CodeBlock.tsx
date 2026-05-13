import { isValidElement, ReactNode } from 'react';
import hljs from 'highlight.js/lib/common';

type CodeElementProps = {
	children?: ReactNode;
	className?: string;
};

function getTextContent(node: ReactNode): string {
	if (typeof node === 'string') {
		return node;
	}

	if (typeof node === 'number') {
		return String(node);
	}

	if (Array.isArray(node)) {
		return node.map(getTextContent).join('');
	}

	if (isValidElement<{ children?: ReactNode }>(node)) {
		return getTextContent(node.props.children);
	}

	return '';
}

export default function CodeBlock({ children }: { children?: ReactNode }) {
	if (!isValidElement<CodeElementProps>(children)) {
		return <pre>{children}</pre>;
	}

	const className = children.props.className ?? '';
	const match = className.match(/language-([\w-]+)/);
	const language = match?.[1];
	const code = getTextContent(children.props.children).replace(/\n$/, '');

	const highlighted = language && hljs.getLanguage(language)
		? hljs.highlight(code, { language }).value
		: hljs.highlightAuto(code).value;

	const highlightedClassName = ['hljs', className].filter(Boolean).join(' ');

	return (
		<pre className={highlightedClassName}>
			<code dangerouslySetInnerHTML={{ __html: highlighted }} />
		</pre>
	);
}
