const TIME_FORMATTER = new Intl.DateTimeFormat('de-DE', {
	timeStyle: 'short',
	timeZone: 'Europe/Berlin',
});

export const formatResetTime = (reset: number | null): string | null => {
	if (reset === null) {
		return null;
	}

	const date = new Date(reset * 1000);
	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return TIME_FORMATTER.format(date);
};
