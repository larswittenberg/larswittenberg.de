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
		<LayoutDefault>
			<ul>
				{filteredBlogPosts.map((post) => (
				<li key={post.filePath} className="mb-16">
					{post.data.date && (
						<p>{new Intl.DateTimeFormat('de-DE', { year: 'numeric', month: 'long', day: '2-digit' }).format(Date.parse(post.data.date))}</p>
					)}
					<NextLink
						as={`/blog/${post.filePath.replace(/\.mdx?$/, '')}`}
						href={`/blog/[slug]`}
					>
						<h2 className="text-4xl">
							<a className="inline-block mb-4 shadow-link hover:shadow-linkhover hover:text-black hover:cursor-pointer transition-all">{post.data.title}</a>
						</h2>
					</NextLink>
					<ul className="flex">
						{post.data.tags && post.data.tags.map((tag, index) => (
							<li key={index} className="pr-4">#{(tag)}</li>
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
