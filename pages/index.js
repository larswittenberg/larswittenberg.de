import Image from 'next/image'
import Link from 'next/link'
import LayoutDefault from '../components/LayoutDefault'

const links = [
	{ href: 'https://nextjs.org/', label: 'Next.js' },
	{ href: 'https://tailwindcss.com/', label: 'Tailwind CSS' },
	{ href: 'https://purgecss.com/', label: 'PurgeCSS' },
	{ href: 'https://github.com/garmeeh/next-seo', label: 'Next SEO' },
	{ href: 'https://tailwindcss.com/docs/typography-plugin', label: '@tailwindcss/typography Plugin' },
]

export default function IndexPage() {
	return (
		<LayoutDefault>
			<div className="py-20">
				<h1 className="text-5xl text-center mb-12">
					Next.js + Tailwind CSS Kickstarter
				</h1>
				<h2 className="text-center text-3xl mb-2">Tech Stack</h2>
				<ul className="w-2/3 m-auto flex flex-wrap items-center justify-between">
				{links.map(({ href, label }) => (
					<li key={`${href}${label}`}>
					<a href={href} className="underline p-1">
						{label}
					</a>
					</li>
				))}
				</ul>
			</div>

			<hr className="my-16" />

			<h2 className="text-center mb-8 text-2xl">
				<Link href="/subpage">
					<a className="underline">Demo-Page with @tailwindcss/typography Plugin</a>
				</Link>
			</h2>


			<hr className="my-16" />

			<p className="text-[#ff0]">
				Lorem ipsum, dolor sit amet consectetur adipisicing elit. Id corrupti maxime similique quisquam sunt quis vero culpa <em>awesome</em> ipsum ullam vel odit eligendi, quo illum, aliquid sequi quae. Possimus, dignissimos!
			</p>
			<p className="">
				Lorem ipsum, dolor sit amet consectetur adipisicing elit. Id corrupti maxime similique quisquam sunt quis vero culpa <em>awesome</em> ipsum ullam vel odit eligendi, quo illum, aliquid sequi quae. Possimus, dignissimos!
			</p>

			<hr className="my-16" />


			<h2 className="text-center mb-8 text-2xl">Next.js Image Demo</h2>
			<figure>
				<Image
					src="/images/unsplash.jpg"
					width={1920}
					height={1280}
					alt="Alpe di Siusi, Italia from Pietro De Grandi from Unsplash"
				/>
				<figcaption>
					<span>Alpe di Siusi, Italia. Photo by <a href="https://unsplash.com/@peter_mc_greats?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Pietro De Grandi</a> on <a href="https://unsplash.com/images/nature?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
				</figcaption>
			</figure>


		</LayoutDefault>
	)
}
