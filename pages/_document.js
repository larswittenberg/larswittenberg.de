import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(props) {
	return (
		<Html lang="de">
			<Head>
				<link href="/favicon.svg" rel="shortcut icon" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
