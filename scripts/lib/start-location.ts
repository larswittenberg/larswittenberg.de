import fs from 'node:fs';
import zlib from 'node:zlib';
import { Decoder, Stream } from '@garmin/fitsdk';
import { COORDINATE_DECIMALS } from '../../src/lib/strava/schema';
import type { StravaActivityLocation } from '../../src/types/strava';

const NO_LOCATION: StravaActivityLocation = { start_lat: null, start_lng: null };

const FACTOR = 10 ** COORDINATE_DECIMALS;
const round = (value: number) => Math.round(value * FACTOR) / FACTOR;

/** Rounds to COORDINATE_DECIMALS; invalid values and 0/0 ("null island", no GPS fix) give null. */
export function toStartLocation(lat: number | null | undefined, lng: number | null | undefined): StravaActivityLocation {
	if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
		return NO_LOCATION;
	}
	if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || (lat === 0 && lng === 0)) return NO_LOCATION;
	return { start_lat: round(lat), start_lng: round(lng) };
}

// FIT stores positions as semicircles: degrees = semicircles * 180 / 2^31.
const SEMICIRCLES_TO_DEGREES = 180 / 2 ** 31;
const fromSemicircles = (value: unknown) => (typeof value === 'number' ? value * SEMICIRCLES_TO_DEGREES : null);

function fitStartLocation(data: Buffer): StravaActivityLocation {
	const decoder = new Decoder(Stream.fromBuffer(data));
	if (!decoder.isFIT()) throw new Error('keine gültige FIT-Datei');
	const { messages } = decoder.read({ convertTypesToStrings: false, mergeHeartRates: false });

	for (const session of messages.sessionMesgs ?? []) {
		const location = toStartLocation(fromSemicircles(session.startPositionLat), fromSemicircles(session.startPositionLong));
		if (location.start_lat !== null) return location;
	}
	for (const record of messages.recordMesgs ?? []) {
		const location = toStartLocation(fromSemicircles(record.positionLat), fromSemicircles(record.positionLong));
		if (location.start_lat !== null) return location;
	}
	return NO_LOCATION;
}

const attr = (attrs: string, name: string) => {
	const match = attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`));
	return match ? Number(match[1]) : null;
};

function gpxStartLocation(xml: string): StravaActivityLocation {
	for (const [, attrs] of xml.matchAll(/<(?:\w+:)?trkpt\b([^>]*)>/g)) {
		const location = toStartLocation(attr(attrs, 'lat'), attr(attrs, 'lon'));
		if (location.start_lat !== null) return location;
	}
	return NO_LOCATION;
}

function tcxStartLocation(xml: string): StravaActivityLocation {
	const pattern =
		/<(?:\w+:)?LatitudeDegrees>\s*([-\d.eE+]+)\s*<\/(?:\w+:)?LatitudeDegrees>\s*<(?:\w+:)?LongitudeDegrees>\s*([-\d.eE+]+)\s*</g;
	for (const [, lat, lng] of xml.matchAll(pattern)) {
		const location = toStartLocation(Number(lat), Number(lng));
		if (location.start_lat !== null) return location;
	}
	return NO_LOCATION;
}

export const SUPPORTED_EXTENSIONS = ['.fit', '.gpx', '.tcx'] as const;

/** Format from the file name, ignoring a trailing ".gz"; null for unsupported files. */
export function fileFormat(file: string): (typeof SUPPORTED_EXTENSIONS)[number] | null {
	const name = file.toLowerCase().replace(/\.gz$/, '');
	return SUPPORTED_EXTENSIONS.find((ext) => name.endsWith(ext)) ?? null;
}

/** Reads the first valid GPS position from an export activity file (.fit/.gpx/.tcx, optionally gzipped). */
export function readStartLocation(file: string): StravaActivityLocation {
	const format = fileFormat(file);
	if (!format) throw new Error('nicht unterstütztes Dateiformat');
	let data = fs.readFileSync(file);
	if (file.toLowerCase().endsWith('.gz')) data = zlib.gunzipSync(data);

	if (format === '.fit') return fitStartLocation(data);
	const xml = data.toString('utf8');
	return format === '.gpx' ? gpxStartLocation(xml) : tcxStartLocation(xml);
}
