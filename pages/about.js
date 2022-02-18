import NextLink from 'next/link'
import NextImage from 'next/image'
import LayoutDefault from '../components/LayoutDefault'
import SocialIcons from '../components/SocialIcons'

const list = ['HTML / (S)CSS', 'JavaScript', 'React', 'Responsive Webdesign', 'Styleguides', 'Browserkompatibilität', 'Barrierefreiheit', 'PHP & MySQL', 'Git Versionsverwaltung', 'Konzeption', 'UI / UX', 'Projektmanagement', 'Kundenbetreuung', 'Datenschutz']


export default function AboutPage() {
	return (
		<LayoutDefault>
			<article className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl mx-auto">
				<h1 className="">
					About
				</h1>

				<div className="md:flex justify-between md:mb-20">
					<NextImage src="/images/lars-wittenberg.jpg" alt="Lars Wittenberg" width="500" height="500" className="rounded-full" />
					<div>
						<h2>Lars Wittenberg</h2>
						<p>
							Macht was in diesem Internet.<br />Pixelschubser. Coder. Nerd.<br />Fahrradfahrer.
						</p>
						<p>
							<NextLink href="/uses" passHref><a className="underline">/uses</a></NextLink>
						</p>
						<SocialIcons size="small" />
					</div>
				</div>


				<h2>Zusammenfassung</h2>

				<p>Meine Expertise als Web Developer mit dem Schwerpunkt Frontend-Entwicklung beruht auf über 15 Jahren Erfahrung. In dieser Zeit habe ich für viele Webseiten das Frontend umgesetzt, Styleguides erstellt, Web-Apps und Mircosites entwickelt, mit verschiedenen Content Management Systemen gearbeitet aber auch Erfahrungen in Kundenbetreuung und Projektmanagement gesammelt. Mit großem Interesse verfolge ich zudem die Weiterentwicklungen rund um neue Internet-Technologien und Trends.</p>
				<p>Wenn ich nicht am Mac arbeite, trifft man mich zumeist auf meinem Rennrad, auf meinem Gravel-Bike oder in der Natur beim wandern an.</p>


				<h2>Kompetenzen</h2>

				<ul className="">
					{list.map((item, i) => <li key={i}>{item}</li> )}
				</ul>
			</article>
		</LayoutDefault>
	)
}

