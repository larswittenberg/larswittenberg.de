import NextLink from 'next/link'

export default function CustomLink({ as, href, ...otherProps }) {
	return (
		<>
			<NextLink as={as} href={href} {...otherProps} />
		</>
	)
}
