export const toTimestamp = (value: string | null | undefined): number | null => {
	if (!value) {
		return null;
	}

	const timestamp = new Date(value).getTime();
	return Number.isNaN(timestamp) ? null : timestamp;
};
