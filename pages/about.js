import Link from 'next/link'
import NextImage from 'next/image'
import LayoutDefault from '../components/LayoutDefault'
import SocialIcons from '../components/SocialIcons'

const list = [
	'HTML / (S)CSS',
	'JavaScript',
	'React',
	'Next.js',
	'Tailwind CSS',
	'Styleguides',
	'Storybook.js',
	'Responsive Webdesign',
	'Browserkompatibilität',
	'Barrierefreiheit',
	'Frontend Workflow',
	'PHP & MySQL',
	'Git Versionsverwaltung',
	'Konzeption',
	'Teamwork',
	'Landingpages',
	'Newsletter',
	'UI / UX',
	'Projektmanagement',
	'Kundenbetreuung',
	'Datenschutz',
]

export default function AboutPage() {
	return (
		<LayoutDefault prose>
			<article>
				<h1>About</h1>

				<div className="md:flex justify-between md:mb-20">
					<NextImage
						src="/images/lars-wittenberg.jpg"
						alt="Lars Wittenberg"
						width="400"
						height="400"
						className="rounded-full"
					/>
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
						<p>
							<Link href="/uses">
								/uses
							</Link>
						</p>
						<SocialIcons size="small" />
					</div>
				</div>

				<h2>Zusammenfassung</h2>

				<p>
					Meine Expertise als Web Developer mit dem Schwerpunkt
					Frontend-Entwicklung beruht auf über 15 Jahren Erfahrung. In
					dieser Zeit habe ich für viele Webseiten das Frontend
					umgesetzt, Styleguides erstellt, Web-Apps und Mircosites
					entwickelt, mit verschiedenen Content Management Systemen
					gearbeitet aber auch Erfahrungen in Kundenbetreuung und
					Projektmanagement gesammelt. Mit großem Interesse verfolge
					ich zudem die Weiterentwicklungen rund um neue
					Internet-Technologien und Trends.
				</p>
				<p>
					Wenn ich nicht am Mac arbeite, trifft man mich zumeist auf
					meinem Rennrad, auf meinem Gravel-Bike oder in der Natur
					beim wandern an.
				</p>

				<h2>Kompetenzen</h2>

				<ul className="">
					{list.map((item, i) => (
						<li key={i}>{item}</li>
					))}
				</ul>
			</article>
		</LayoutDefault>
	)
}
