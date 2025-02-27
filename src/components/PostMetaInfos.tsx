export default function PostMetaInfos({ date, update }: { date: string; update?: string }) {
	return (
		<p className="mb-12 text-base">
			Veröffentlich am:{' '}
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
