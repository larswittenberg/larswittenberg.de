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
update: '2024-10-17'
desc: ''
---

import Image from 'next/image';


Inspiriert von [Wes Bos](https://wesbos.com/uses/) und durch sein [uses.tech Projekt](https://uses.tech/) habe ich hier meine verwendeten Produkte aufgelistet.

Auf Github habe ich ein [Repository mit meinem macOS-Setup](https://github.com/larswittenberg/mac-setup) samt detailierten Einstellungen und Programmen veröffentlicht.

<Figure>
	<Image src="/images/schreibtisch.jpg" width="1920" height="1464" alt="Mein Homeoffice Schreibtisch-Setup" priority />
</Figure>

## Hardware

### Privat (Homeoffice)
- [LG 4K Monitor 27" mit USB-C](https://www.amazon.de/gp/product/B07MKT1W65)
- [BenQ 24" Monitor im Hochformat als zweiter Monitor](https://www.amazon.de/gp/product/B00UAMYTR8)
- [Logitech MX Keys Tastatur](https://www.amazon.de/Logitech-Keys-fortschrittliche-Batterielebensdauer-Metallaufbau/dp/B07W7LMCF9/)
- [Logitech MX Master Maus](https://www.amazon.de/Logitech-MX-Master-AMZ-Kabellose-Bluetooth-Windows-schwarz/dp/B0761YL588/)
- [Anker PowerConf C200 2K USB-Webcam](https://www.amazon.de/gp/product/B09MFMTMPD)
- [Elgato Stream Deck](https://www.elgato.com/de/de/p/stream-deck-mk2-black)
- Synology NAS DS216play
- Externe SSD mit 512GB [WD My Passport SSD](https://www.amazon.de/Passport-Festplatte-Kennwortschutz-automatische-Datensicherung/dp/B07C5BG857/ref=sr_1_1_sspa)
- [NoVoo 7 in 1 USB-C Adapter](https://www.amazon.de/gp/product/B0957DFS8V)
- Nest Wifi-Router
- LED Schreibtischlampe von [Eyocean](https://www.amazon.de/gp/product/B07RKQMX15/)
- [Vertikal Laptop Ständer](https://www.amazon.de/gp/product/B074PPGHMC)
- [Schreibtischunterlage](https://www.amazon.de/gp/product/B09X6M3ZHT/)
- Elektrisch verstellbarer Steh-Schreibtisch ["E7" von Flexispot](https://www.flexispot.de/elektrisch-hohenverstellbares-tischgestell-e7.html)
- Sitz-/Stehstütze [Lidkullen von IKEA](https://www.ikea.com/de/de/p/lidkullen-sitz-stehstuetze-aktiv-gunnared-dunkelgrau-30445774/) als Hocker


### Beruflich
- MacBook Pro 14" M1 Max von 2021
- Dell UltraSharp 34" Curved Monitor
- Headset Plantronics Voyager Focus UC
- Monitor-Standfuß aus Holz von [Samdi](https://www.amazon.de/Samdi-H%C3%B6lzerne-Universal-Elegante-Halterung-Schwarze-Walnuss/dp/B0753DCGX1?ref_=ast_bbp_dp)


## Software

### Entwicklung
- [Visual Studio Code](https://code.visualstudio.com/)
- [Cobalt 2](https://marketplace.visualstudio.com/items?itemName=wesbos.theme-cobalt2) VS Code Theme
- [Hack](https://sourcefoundry.org/hack/) VS Code Font
- [iTerm2](https://iterm2.com/) als Terminal
- [Tower](https://www.git-tower.com/mac) als Git Client
- [SnippetsLab](https://www.renfei.org/snippets-lab/) zur Code Snippet Verwaltung
- [Github Desktop](https://desktop.github.com/) als Git Client
- [FileZilla](https://filezilla-project.org/) als FTP-Client
- [Sequel Ace](https://sequel-ace.com/) als MySQL Datenbanken Client


### Desktop Apps

Hier nur ein paar als Empfehlung die sich in meinem Alltag bewährt haben.

- [Shottr](https://shottr.cc/) für mehr Screenshot Funktionen
- [Maccy](https://maccy.app/) Clipboard manager for macOS which does one job
- [Raycast](https://www.raycast.com/) das bessere Spotlight und besser als Alfred
- [Rocket Typist - Snippet-Editor](https://www.witt-software.com/rockettypist/)
- [Tiles](https://www.sempliva.com/tiles/) für Fenster-Management
- [MarkEdit for Markdown - Text-Editor](https://apps.apple.com/us/app/markedit-for-markdown/id1669953820?mt=12)
- [NameChanger](https://mrrsoftware.com/namechanger/) schnelle Umbenennung von Dateien


### Chrome Browser Erweiterungen

- [Validity](https://chrome.google.com/webstore/detail/validity/bbicmjjbohdfglopkidebfccilipgeif) HTML Validierung direkt auf der geöffneten Website
- [Pesticide](https://chrome.google.com/webstore/detail/pesticide-for-chrome/bblbgcheenepgnnajgfpiicnbbdmmooh) zum aufspüren von Layout-Fehlern auf einer Website
- [Full Page Screen Capture](https://chrome.google.com/webstore/detail/full-page-screen-capture/fdpohaocaechififmbbbbbknoalclacl) scrollt automatisch die Website runter und macht einen großen Screenshot davon


## Weiteres

- Smartphone Google Pixel 7 Pro
- Apple iPad Air (4. Gen)
- iPad Air Tastatur [Logitech Combo Touch](https://www.amazon.de/gp/product/B07W6HP8ZG/)
- [Bluetooth Kopfhörer Google Pixel Buds Pro 2](https://store.google.com/product/pixel_buds_pro_2?hl=de)
- [Ortlieb Commuter Daypack Urban](https://www.ortlieb.com/de/commuter-daypack-urban-line+R4155) Rucksack.


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
