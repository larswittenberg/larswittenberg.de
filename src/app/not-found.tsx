import Link from 'next/link';

export default function NotFound() {
	return (
		<div>
			<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-none mb-12">
				404
				<br />
				Seite nicht gefunden 😢
				<br />
			</h1>
			<p>
				<Link href="/">Return Home</Link>
			</p>
		</div>
	);
}
