import cn from 'classnames'

export default function CustomFigure({ props, bigger, half, children }) {
	let ClassNames = cn({
		'text-center': true,
		'lg:w-[120%] lg:ml-[-10%]': bigger,
		'md:w-[48%]': half,
	})

	return (
		<figure className={ClassNames} {...props}>
			{children}
		</figure>
	)
}
