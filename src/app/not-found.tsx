import LayoutDefault from '@/components/LayoutDefault';

export default function NotFound() {
	return (
		<LayoutDefault fullWidth centerVertical>
			<div className="mx-auto max-w-150 md:max-w-none">
				<h1 className="mb-12 text-3xl leading-none font-extrabold sm:text-5xl lg:text-6xl">
					404
					<br />
					Seite nicht gefunden 😢
					<br />
				</h1>
			</div>
		</LayoutDefault>
	);
}
