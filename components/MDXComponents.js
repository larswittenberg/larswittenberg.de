import Image from 'next/image';
import CustomLink from './atoms/CustomLink'
import CustomFigure from './atoms/CustomFigure'
import FlexWrapper from './atoms/FlexWrapper'

const MDXComponents = {
	Image,
	FlexWrapper,
	a: CustomLink,
	Figure: CustomFigure,
}

export default MDXComponents
