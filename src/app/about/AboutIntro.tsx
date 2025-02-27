import Link from 'next/link';
import NextImage from 'next/image';
import SocialIcons from '@/components/SocialIcons';

export function AboutIntro() {
	return (
		<div className="justify-between md:mb-20 md:flex">
			<NextImage
				src="/images/lars-wittenberg.jpg"
				alt="Lars Wittenberg"
				width="400"
				height="400"
				className="rounded-full"
			/>
			<div className="md:ml-8">
				## Lars Wittenberg Macht was in diesem Internet.
				<br />
				Pixelschubser. Coder. Nerd.
				<br />
				Rennradfahrer. Gravelbikefahrer.
				<br />
				#frontend #effzeh #cyclinglife
				<Link href="/uses">/uses</Link>
				<SocialIcons size="small" />
			</div>
		</div>
	);
}
