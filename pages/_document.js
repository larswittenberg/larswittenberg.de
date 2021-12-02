import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(props) {
	return (
		<Html lang="de" className="bg-orange">
			<Head>
				<link href="/favicon.svg" rel="shortcut icon" />
			</Head>
			<body className="border-8 border-solid border-orange">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
