import LayoutDefault from '../components/LayoutDefault'

export default function IndexPage() {
	return (
		<LayoutDefault fullWidth centerVertical>
			<div className="mx-32">
				<h1 className="text-8xl font-extrabold leading-none mb-12">
					404
					<br />
					Seite nicht gefunden 😢
					<br />
				</h1>
			</div>
		</LayoutDefault>
	)
}

