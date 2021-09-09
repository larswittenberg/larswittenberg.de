import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { postFilePaths, POSTS_PATH } from '../../utils/mdxUtils'
import LayoutDefault from '../../components/LayoutDefault'
import components from '../../components/MDXComponents'


export default function PostPage({ source, frontMatter }) {
	return (
		<LayoutDefault>
			<div className="prose prose-sm sm:prose lg:prose-lg mx-auto">
				<h1>{frontMatter.title}</h1>
				{frontMatter.desc && (
					<p className="">{frontMatter.desc}</p>
				)}

				<MDXRemote {...source} components={components} />
			</div>
		</LayoutDefault>
	)
}

export const getStaticProps = async ({ params }) => {
	const postFilePath = path.join(POSTS_PATH, `${params.slug}.mdx`)
	const source = fs.readFileSync(postFilePath)
	const { content, data } = matter(source)

	const mdxSource = await serialize(content, {
		// Optionally pass remark/rehype plugins
		mdxOptions: {
			remarkPlugins: [],
			rehypePlugins: [],
		},
		scope: data,
	})

	return {
		props: {
			source: mdxSource,
			frontMatter: data,
		},
	}
}

export const getStaticPaths = async () => {
	const paths = postFilePaths
		// Remove file extensions for page paths
		.map((path) => path.replace(/\.mdx?$/, ''))
		// Map the path into the static paths object required by Next.js
		.map((slug) => ({ params: { slug } }))

	return {
		paths,
		fallback: false,
	}
}
