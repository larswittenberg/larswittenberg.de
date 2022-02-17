// import Image from 'next/image'
import NextLink from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { postFilePaths, POSTS_PATH } from '../utils/mdxUtils'
import LayoutDefault from '../components/LayoutDefault'
import { urlToHttpOptions } from 'url'


export default function BlogPage({ posts }) {
	let filteredBlogPosts = posts.filter(i => i.data.draft === false)
	filteredBlogPosts.sort(
		(a, b) => Number(new Date(b.data.date)) - Number(new Date(a.data.date))
	)
	// console.log(filteredBlogPosts)

	return (
		<LayoutDefault className="">
			<h1 className="font-bold text-6xl mb-16">Blog-Artikel</h1>

			<ul className="list-none">
				{filteredBlogPosts.map((post) => (
				<li key={post.filePath} className="mb-16 pl-0">
					{post.data.date && (
						<p className="text-base">
							{new Intl.DateTimeFormat('de-DE', { year: 'numeric', month: 'long', day: '2-digit' }).format(Date.parse(post.data.date))}
						</p>
					)}
					<NextLink
						as={`/blog/${post.filePath.replace(/\.mdx?$/, '')}`}
						href={`/blog/[slug]`}
						passHref
					>
						<h2 className="font-bold text-4xl mb-2">
							<a className="shadow-link hover:shadow-linkhover hover:text-black hover:cursor-pointer transition-all">{post.data.title}</a>
						</h2>
					</NextLink>
					<ul className="flex">
						{post.data.tags && post.data.tags.map((tag, index) => (
							<li key={index} className="text-base pr-4">#{(tag)}</li>
						))}
					</ul>
				</li>
				))}
			</ul>
		</LayoutDefault>
	)
}



export function getStaticProps() {
	const posts = postFilePaths.map((filePath) => {
		const source = fs.readFileSync(path.join(POSTS_PATH, filePath))
		const { content, data } = matter(source)

		return {
			content,
			data,
			filePath,
		}
	})

	return { props: { posts } }
}
