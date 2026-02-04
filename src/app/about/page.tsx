import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';
import SocialIcons from '@/components/SocialIcons';

export const metadata: Metadata = {
	title: 'About',
};

const list = [
	'HTML / (S)CSS / JavaScript',
	'React',
	'Next.js',
	'Tailwind CSS',
	'Strapi CMS',
	'Material UI',
	'Styleguides',
	'Storybook.js',
	'Responsive Webdesign',
	'Browserkompatibilität',
	'Barrierefreiheit',
	'Frontend Workflow',
	'Git Versionsverwaltung',
	'PHP & MySQL',
	'Konzeption',
	'Teamwork',
	'Landingpages',
	'Newsletter',
	'UI / UX',
	'Projektmanagement',
	'Kundenbetreuung',
	'Datenschutz',
];

export default async function Page() {
	return (
		<LayoutDefault prose>
			<article>
				<h1>About</h1>

				<div className="justify-between md:mb-20 md:flex">
					<div className="group relative aspect-square w-full max-w-100 perspective-[1000px]">
						<div className="relative h-full w-full transition-all duration-700 transform-3d group-hover:transform-[rotateY(180deg)]">
							<div className="absolute inset-0 backface-hidden">
								<Image
									src="/images/lars-wittenberg.jpg"
									alt="Lars Wittenberg"
									width="400"
									height="400"
									className="h-auto w-full rounded-full"
								/>
							</div>
							<div className="absolute inset-0 backface-hidden transform-[rotateY(180deg)]">
								<Image
									src="/images/lars-wittenberg_cycling.jpg"
									alt="Lars Wittenberg - Beim Rennradfahren"
									width="400"
									height="400"
									className="h-auto w-full rounded-full"
								/>
							</div>
						</div>
					</div>

					<div className="md:ml-8">
						<h2>Lars Wittenberg</h2>
						<p>
							Macht was in diesem Internet.
							<br />
							Pixelschubser. Coder. Nerd.
							<br />
							Rennradfahrer. Gravelbikefahrer.
							<br />
							#frontend #effzeh #cyclinglife
						</p>
						<p className="mb-8!">
							<Link href="/uses">/uses</Link>
						</p>
						<SocialIcons size="small" />
					</div>
				</div>

				<h2>Zusammenfassung</h2>

				<p>
					Meine Expertise als Web Developer mit dem Schwerpunkt Frontend-Entwicklung beruht auf über 16 Jahren
					Erfahrung. In dieser Zeit habe ich für viele Webseiten das Frontend umgesetzt, Styleguides erstellt,
					Web-Apps und Mircosites entwickelt, mit verschiedenen Content Management Systemen gearbeitet aber
					auch Erfahrungen in Kundenbetreuung und Projektmanagement gesammelt. Mit großem Interesse verfolge
					ich zudem die Weiterentwicklungen rund um neue Internet-Technologien und Trends.
				</p>
				<p>
					Wenn ich nicht am Mac arbeite, trifft man mich zumeist auf meinem Rennrad, auf meinem Gravel-Bike
					oder in der Natur beim wandern an.
				</p>

				<h2>Kompetenzen</h2>

				<ul className="">
					{list.map((item, i) => (
						<li key={i}>{item}</li>
					))}
				</ul>
			</article>
		</LayoutDefault>
	);
}
