export default function CustomFigure({ props, centerCaption, children }) {
	return (
		<figure className={` ${centerCaption ? 'text-center' : 'text-left'} `} {...props}>
			{children}
		</figure>
	)
}
