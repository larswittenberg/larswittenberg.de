import LayoutDefault from '../components/LayoutDefault'

export default function IndexPage() {
	return (
		<LayoutDefault fullWidth centerVertical>
			<div className="mx-auto max-w-150 md:max-w-none">
				<h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-none mb-12">
					404
					<br />
					Seite nicht gefunden 😢
					<br />
				</h1>
			</div>
		</LayoutDefault>
	)
}
