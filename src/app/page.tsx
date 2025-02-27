import LayoutDefault from '@/components/LayoutDefault';
import SocialIcons from '@/components/SocialIcons';

export default async function IndexPage() {
	return (
		<LayoutDefault fullWidth centerVertical>
			<div className="mx-auto max-w-[460px] font-extrabold md:max-w-none">
				<p className="text-4xl sm:text-6xl md:text-8xl">
					Hi!{' '}
					<span role="img" aria-label="Friedenszeichen Emoji">
						✌️
					</span>
				</p>
				<h1 className="mb-12 text-3xl leading-none sm:text-5xl lg:text-6xl">
					Ich bin Lars Wittenberg.
					<br />
					<small className="text-xl sm:text-4xl lg:text-5xl">Frontend Web Developer aus Stuttgart.</small>
				</h1>
				<SocialIcons />
			</div>
		</LayoutDefault>
	);
}
