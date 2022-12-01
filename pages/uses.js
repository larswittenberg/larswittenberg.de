import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import matter from 'gray-matter'
import LayoutDefault from '../components/LayoutDefault'
import components from '../components/MDXComponents'

export default function UsesPage({ source, frontMatter }) {
	return (
		<LayoutDefault prose>
			<article>
				<h1>{frontMatter.title}</h1>
				<p className="text-base mb-12">
					Veröffentlich am:{' '}
					{new Intl.DateTimeFormat('de-DE', {
						year: 'numeric',
						month: 'long',
						day: '2-digit',
					}).format(Date.parse(frontMatter.date))}{' '}
					{frontMatter.update
						? ` // Letztes Update: ${new Intl.DateTimeFormat(
								'de-DE',
								{
									year: 'numeric',
									month: 'long',
									day: '2-digit',
								},
						  ).format(Date.parse(frontMatter.update))}`
						: ''}
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
update: '2022-11-16'
desc: ''
---

import Image from 'next/image';


Inspiriert von [Wes Bos](https://wesbos.com/uses/) und durch sein [uses.tech Projekt](https://uses.tech/) habe ich hier meine verwendeten Produkte aufgelistet.

Auf Github habe ich ein [Repository mit meinem macOS-Setup](https://github.com/larswittenberg/mac-setup) samt detailierten Einstellungen und Programmen veröffentlicht.


## Hardware

### Privat (Homeoffice)
- [LG 4K Monitor 27" mit USB-C](https://www.amazon.de/gp/product/B07MKT1W65)
- [BenQ 24" Monitor im Hochformat als second screen](https://www.amazon.de/gp/product/B00UAMYTR8)
- [Logitech MX Keys Tastatur](https://www.amazon.de/Logitech-Keys-fortschrittliche-Batterielebensdauer-Metallaufbau/dp/B07W7LMCF9/)
- [Logitech MX Master Maus](https://www.amazon.de/Logitech-MX-Master-AMZ-Kabellose-Bluetooth-Windows-schwarz/dp/B0761YL588/)
- Synology NAS DS216play
- Externe SSD mit 512GB [WD My Passport SSD](https://www.amazon.de/Passport-Festplatte-Kennwortschutz-automatische-Datensicherung/dp/B07C5BG857/ref=sr_1_1_sspa)
- Nest Wifi-Router
- LED Schreibtischlampe von [Eyocean](https://www.amazon.de/gp/product/B07RKQMX15/)
- [Steh-Schreibtisch "Skarsta"](https://www.ikea.com/de/de/p/skarsta-schreibtisch-sitz-steh-weiss-s59324818/) von Ikea in der Größe 120x70 cm
- Büro-Stuhl: Keiner. Der Steh-Schreibtisch bleibt immer oben.


### Beruflich
- MacBook Pro 14" M1 Max von 2021
- Dell UltraSharp 34" Curved Monitor
- Logitech MX Master Maus (ich nutze das gleiche Model im Büro und privat)
- Monitor-Standfuß aus Holz von [Samdi](https://www.amazon.de/Samdi-H%C3%B6lzerne-Universal-Elegante-Halterung-Schwarze-Walnuss/dp/B0753DCGX1?ref_=ast_bbp_dp)



## Software

### Entwicklung
- [Visual Studio Code](https://code.visualstudio.com/) (~~Sublime Text~~, ~~Atom~~)
- VS Code Theme: [Cobalt 2](https://marketplace.visualstudio.com/items?itemName=wesbos.theme-cobalt2)
- VS Code Font: [Hack](https://sourcefoundry.org/hack/)
- [iTerm2](https://iterm2.com/) als Terminal
- [Tower](https://www.git-tower.com/mac) als Git Client
- [Github Desktop](https://desktop.github.com/) als Git Client
- [FileZilla](https://filezilla-project.org/) als FTP-Client
- [Sequel Ace](https://sequel-ace.com/) als MySQL Datenbanken Client


### Desktop Apps

Hier nur ein paar als Empfehlung die sich in meinem Alltag bewährt haben.

- [Evernote](https://evernote.com/intl/de/) als digitales Notizbuch für alles
- [Shottr](https://shottr.cc/) für mehr Screenshot Funktionen
- [Clippy](https://clipy-app.com/) als erweiterte Zwischenablage
- [Tiles](https://www.sempliva.com/tiles/) für Fenster-Management
- [NameChanger](https://mrrsoftware.com/namechanger/) schnelle Umbenennung von Dateien
- [Raycast](https://www.raycast.com/) das bessere Spotlight und besser als Alfred


### Chrome Browser Erweiterungen

- [Validity](https://chrome.google.com/webstore/detail/validity/bbicmjjbohdfglopkidebfccilipgeif) HTML Validierung direkt auf der geöffneten Website
- [Pesticide](https://chrome.google.com/webstore/detail/pesticide-for-chrome/bblbgcheenepgnnajgfpiicnbbdmmooh) zum aufspüren von Layout-Fehlern auf einer Website
- [Full Page Screen Capture](https://chrome.google.com/webstore/detail/full-page-screen-capture/fdpohaocaechififmbbbbbknoalclacl) scrollt automatisch die Website runter und macht einen großen Screenshot davon



## Fotografie

- Sony Alpha 6000 Systemkamera mit APS-C Sensor
- Objektiv Sony SELP18105G 18-105mm F4
- Objektiv Sigma 30mm F1.4
- Objektiv Samyang 12mm f2.0
- [Rollei Stativ C4i](https://www.amazon.de/Rollei-C4i-Panorama-Kugelkopf-Stativtasche-kompatibel/dp/B01A8QUK50)
- [Kamerarucksack von K&F Concept](https://www.amazon.de/gp/product/B06XKNYQX4/)
- [Cosyspeed CAMSLINGER Outdoor](https://www.cosyspeed.com/en/products/camslinger-outdoor-mk-ii?variant=28586813227086) Hüfttasche für Wanderungen


## Weiteres

- Smartphone Google Pixel 7 Pro
- Smartwatch Google Pixel Watch
- Apple iPad Air (4. Gen)
- iPad Air Tastatur [Logitech Combo Touch](https://www.amazon.de/gp/product/B07W6HP8ZG/)
- [Bluetooth Noise Cancelling Kopfhörer Sony WH-1000XM3](https://www.amazon.de/gp/product/B07GDR2LYK)
- [Bluetooth Kopfhörer Anker Soundcore Liberty Air 2](https://www.amazon.de/gp/product/B07ZHDYH6P)
- [Ortlieb Commuter Daypack Urban](https://www.ortlieb.com/de/commuter-daypack-urban-line+R4155) Rucksack. Wasserdicht, Roll-Schnell-Verschluss, mit Laptop-Fach.


## Fahrrad

- Dazu könnte ich hier auch eigentlich mal ein paar Punkte auflisten.

Bei Fragen zu irgendwelchen Punkten einfach melden :)
`

	const { content, data } = matter(source)
	const mdxSource = await serialize(content, { scope: data })
	return {
		props: {
			source: mdxSource,
			frontMatter: data,
		},
	}
}
