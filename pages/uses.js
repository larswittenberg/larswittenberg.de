import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import matter from 'gray-matter'
import LayoutDefault from '../components/LayoutDefault'
import components from '../components/MDXComponents'

export default function UsesPage({ source, frontMatter }) {
	return (
		<LayoutDefault>
			<article className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl mx-auto">
				<h1>{frontMatter.title}</h1>
				<p className="text-base mb-12">
					Veröffentlich am: {new Intl.DateTimeFormat('de-DE', { year: 'numeric', month: 'long', day: '2-digit' }).format(Date.parse(frontMatter.date))} {frontMatter.update ? ` // Letztes Update: ${new Intl.DateTimeFormat('de-DE', { year: 'numeric', month: 'long', day: '2-digit' }).format(Date.parse(frontMatter.update))}` : ''}
				</p>
				<MDXRemote {...source} components={components} />
			</article>
		</LayoutDefault>
	)
}

export async function getStaticProps() {
	const source = `---
title: 'Uses'
date: '2020-06-03'
update: '2021-12-07'
desc: ''
---

import Image from 'next/image';


Inspiriert von [Wes Bos](https://wesbos.com/uses/) und durch sein [uses.tech Projekt](https://uses.tech/) habe ich hier meine verwendeten Produkte im Hard- und Software Bereich aufgelistet.

Auf Github habe ich ein [Repository mit meinem macOS-Setup](https://github.com/larswittenberg/mac-setup) samt detailierten Einstellungen und Programmen veröffentlicht.


## Hardware

### Privat
- ~~iMac 27" 5K (3,4GHz i5, 24GB, 1TB Fusion Drive)~~
- ~~Apple Wireless Keyboard (ohne Ziffernblock)~~
- [Logitech MX Master Maus](https://www.amazon.de/Logitech-MX-Master-AMZ-Kabellose-Bluetooth-Windows-schwarz/dp/B0761YL588/) (Version 1, kabellos)
- [USB-C Hub von Novoo](https://www.amazon.de/gp/product/B075FGQ988/)
- Externe SSD mit 512GB [WD My Passport SSD](https://www.amazon.de/Passport-Festplatte-Kennwortschutz-automatische-Datensicherung/dp/B07C5BG857/ref=sr_1_1_sspa)
- [Steh-Schreibtisch "Skarsta"](https://www.ikea.com/de/de/p/skarsta-schreibtisch-sitz-steh-weiss-s59324818/) von Ikea in der Größe 120x70 cm
- Büro-Stuhl: Keiner. Der Steh-Schreibtisch bleibt immer oben.


### Beruflich
- MacBook Pro 13" von 2017 (3,1GHz i5, 16GB, 500GB SSD)
- Dell UltraSharp 34" Curved Monitor
- Apple Wireless Keyboard (ohne Ziffernblock)
- Logitech MX Master Maus (ich nutze das gleiche Modell im Büro und privat)
- Monitor-Standfuß aus Holz von [Samdi](https://www.amazon.de/Samdi-H%C3%B6lzerne-Universal-Elegante-Halterung-Schwarze-Walnuss/dp/B0753DCGX1?ref_=ast_bbp_dp)



## Software

### Entwicklung
- [Visual Studio Code](https://code.visualstudio.com/) als Code-Editor (nach ~~Sublime Text~~ & ~~Atom~~)
- VS Code Theme: [Cobalt 2](https://marketplace.visualstudio.com/items?itemName=wesbos.theme-cobalt2)
- VS Code Font: [Hack](https://sourcefoundry.org/hack/)
- [Tower](https://www.git-tower.com/mac) als Git Client
- [Github Desktop](https://desktop.github.com/) als Git Client
- [Sequel Pro Beta](https://sequelpro.com/) als MySQL Datenbanken Client


### Desktop Apps

Hier nur ein paar als Empfehlung die sich in meinem Alltag bewährt haben.

- [Evernote](https://evernote.com/intl/de/) als digitales Notizbuch für alles
- [Monosnap](https://monosnap.com/) für mehr Screenshot Funktionen
- [Clippy](https://clipy-app.com/) als erweiterte Zwischenablage
- [Tiles](https://www.sempliva.com/tiles/) für Fenster-Management
- [Hidden Bar](https://github.com/dwarvesf/hidden) um Menü-Bar Icons zu verstecken
- [NameChanger](https://mrrsoftware.com/namechanger/) schnelle Umbenennung von Dateien
- [Alfred](https://www.alfredapp.com/) das bessere Spotlight
- [LastPass](https://www.lastpass.com/de) speichert meine kryptischen Kennwörter


### Chrome Browser Erweiterungen

- [Full Page Screen Capture](https://chrome.google.com/webstore/detail/full-page-screen-capture/fdpohaocaechififmbbbbbknoalclacl) scrollt automatisch die Website runter und macht einen großen Screenshot davon
- [Validity](https://chrome.google.com/webstore/detail/validity/bbicmjjbohdfglopkidebfccilipgeif) HTML Validierung direkt auf der geöffneten Website
- [Pesticide](https://chrome.google.com/webstore/detail/pesticide-for-chrome/bblbgcheenepgnnajgfpiicnbbdmmooh) zum aufspüren von Layout-Fehlern auf einer Website



## Fotografie

- Sony Alpha 6000 Systemkamera mit APS-C Sensor
- Objektiv Sony SELP18105G 18-105mm F4
- Objektiv Sigma 30mm F1.4
- Objektiv Samyang 12mm f2.0
- [Rollei Stativ C4i](https://www.amazon.de/Rollei-C4i-Panorama-Kugelkopf-Stativtasche-kompatibel/dp/B01A8QUK50)
- [Kamerarucksack von K&F Concept](https://www.amazon.de/gp/product/B06XKNYQX4/)
- [Cosyspeed CAMSLINGER Outdoor](https://www.cosyspeed.com/en/products/camslinger-outdoor-mk-ii?variant=28586813227086) Hüfttasche für Wanderungen


## Weiteres

- Android Smartphone OnePlus 8T
- Bluetooth Kopfhörer Anker Soundcore Liberty Air 2
- Apple iPad Air (4. Gen)
- Als täglicher Rucksack begleitet mich ein [Ortlieb Commuter Daypack Urban](https://www.ortlieb.com/de/commuter-daypack-urban-line+R4155). Wasserdicht, Roll-Schnell-Verschluss, mit Laptop-Fach.

	`

	const { content, data } = matter(source)
	const mdxSource = await serialize(content, { scope: data })
	return {
		props: {
			source: mdxSource,
			frontMatter: data
		}
	}
}
