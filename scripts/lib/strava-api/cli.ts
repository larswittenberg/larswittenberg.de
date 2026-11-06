import { DailyLimitReachedError, ShortTermLimitReachedError } from './client';

export function fail(message: string): never {
	console.error(message);
	process.exit(1);
}

export function parsePositiveInt(name: string, value: string | undefined): number | undefined {
	if (value === undefined) return undefined;
	const n = Number(value);
	if (!Number.isInteger(n) || n <= 0) fail(`Ungültiger Wert für ${name}: ${value}`);
	return n;
}

/** Validates YYYY-MM-DD and returns it unchanged (compares directly with ISO start_date strings). */
export function parseDate(name: string, value: string | undefined): string | undefined {
	if (value === undefined) return undefined;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
		fail(`Ungültiges Datum für ${name}: ${value} (erwartet YYYY-MM-DD)`);
	}
	return value;
}

/** Rate-limit stops are not failures: the scripts exit with code 0 and can be resumed. */
export function isRateLimitStop(err: unknown): err is DailyLimitReachedError | ShortTermLimitReachedError {
	return err instanceof DailyLimitReachedError || err instanceof ShortTermLimitReachedError;
}

export function errorMessage(err: unknown) {
	return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
}
