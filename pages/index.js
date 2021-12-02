import LayoutDefault from '../components/LayoutDefault'
import SocialIcons from '../components/SocialIcons'

export default function IndexPage() {
	return (
		<LayoutDefault fullWidth centerVertical>
			<div className="mx-32">
				<p className="text-8xl font-extrabold">
					Hi!{' '}<span role="img" aria-label="Friedenszeichen Emoji">✌️</span>
				</p>
				<h1 className="text-8xl font-extrabold leading-none mb-12">
					Ich bin Lars Wittenberg.<br />
					<small className="text-6xl ">Frontend Web Developer aus Stuttgart.</small>
				</h1>
				<SocialIcons />
			</div>
		</LayoutDefault>
	)
}

