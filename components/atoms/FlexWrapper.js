import cn from 'classnames'

export default function FlexWrapper({ props, children }) {
	let ClassNames = cn({
		'md:flex justify-between': true,
	})

	return (
		<div className={ClassNames} {...props}>
			{children}
		</div>
	)
}
