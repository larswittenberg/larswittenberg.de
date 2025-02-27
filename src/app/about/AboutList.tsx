export function AboutList() {
	const listitems = [
		'HTML / (S)CSS / JavaScript',
		'React',
		'Next.js',
		'Tailwind CSS',
		'Strapi CMS',
		'Material UI',
		'Styleguides',
		'Storybook.js',
		'Responsive Webdesign',
		'Browserkompatibilität',
		'Barrierefreiheit',
		'Frontend Workflow',
		'Git Versionsverwaltung',
		'PHP & MySQL',
		'Konzeption',
		'Teamwork',
		'Landingpages',
		'Newsletter',
		'UI / UX',
		'Projektmanagement',
		'Kundenbetreuung',
		'Datenschutz',
	];

	return (
		<ul className="">
			{listitems.map((item, i) => (
				<li key={i}>{item}</li>
			))}
		</ul>
	);
}
