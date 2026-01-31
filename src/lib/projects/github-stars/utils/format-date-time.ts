const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('de-DE', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Europe/Berlin',
});

export const formatDateTime = (value: string | null | undefined): string => {
	if (!value) {
		return 'Unbekannt';
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return 'Unbekannt';
	}
	return DATE_TIME_FORMATTER.format(date);
};
