import LayoutDefault from '../components/LayoutDefault'
import SocialIcons from '../components/SocialIcons'

export default function IndexPage() {
	return (
		<LayoutDefault fullWidth centerVertical>
			<div className="mx-auto max-w-[460px] md:max-w-none font-extrabold">
				<p className="text-4xl sm:text-6xl md:text-8xl">
					Hi!{' '}
					<span role="img" aria-label="Friedenszeichen Emoji">
						✌️
					</span>
				</p>
				<h1 className="text-3xl sm:text-5xl lg:text-6xl leading-none mb-12">
					Ich bin Lars Wittenberg.
					<br />
					<small className="text-xl sm:text-4xl lg:text-5xl">
						Frontend Web Developer aus Stuttgart.
					</small>
				</h1>
				<SocialIcons />
			</div>
		</LayoutDefault>
	)
}
