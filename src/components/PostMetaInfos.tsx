export default function PostMetaInfos({
	date,
	update,
	showText,
}: {
	date: string;
	update?: string;
	showText?: boolean;
}) {
	return (
		<p className="mb-12 text-base">
			{showText && `Veröffentlich am: `}
			{new Intl.DateTimeFormat('de-DE', {
				year: 'numeric',
				month: 'long',
				day: '2-digit',
			}).format(Date.parse(date))}{' '}
			{update
				? ` // Letztes Update: ${new Intl.DateTimeFormat('de-DE', {
						year: 'numeric',
						month: 'long',
						day: '2-digit',
					}).format(Date.parse(update))}`
				: ''}
		</p>
	);
}
