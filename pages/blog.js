// import Image from 'next/image'
import NextLink from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { postFilePaths, POSTS_PATH } from '../utils/mdxUtils'
import LayoutDefault from '../components/LayoutDefault'
// import { urlToHttpOptions } from 'url'

export default function BlogPage({ posts }) {
	let filteredBlogPosts = posts.filter((i) => i.data.draft === false)
	filteredBlogPosts.sort(
		(a, b) => Number(new Date(b.data.date)) - Number(new Date(a.data.date)),
	)
	// console.log(filteredBlogPosts)

	return (
		<LayoutDefault prose>
			<section>
				<h1>Blog-Artikel</h1>

				<div className="not-prose">
					<ul className="list-none">
						{filteredBlogPosts.map((post) => (
							<li key={post.filePath} className="mb-16 pl-0">
								{post.data.date && (
									<p className="text-base mt-0 mb-2">
										{new Intl.DateTimeFormat('de-DE', {
											year: 'numeric',
											month: 'long',
											day: '2-digit',
										}).format(Date.parse(post.data.date))}
									</p>
								)}
								<h2 className="font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl  mb-2">
									<NextLink
										as={`/blog/${post.filePath.replace(
											/\.mdx?$/,
											'',
										)}`}
										href={`/blog/[slug]`}
										passHref
									>
										<a className="link">
											{post.data.title}
										</a>
									</NextLink>
								</h2>
								<ul className="flex">
									{post.data.tags &&
										post.data.tags.map((tag, index) => (
											<li
												key={index}
												className="text-base pr-4"
											>
												#{tag}
											</li>
										))}
								</ul>
							</li>
						))}
					</ul>
				</div>
			</section>
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
