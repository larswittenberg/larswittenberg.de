export type ActivityTagKey = 'race' | 'long-run' | 'workout' | 'indoor' | 'commute';

export type ActivityTag = { key: ActivityTagKey; label: string };

// Filter labels in display order; race covers both run races (1) and ride races (11).
export const ACTIVITY_TAG_LABELS: Record<ActivityTagKey, string> = {
	race: 'Wettkampf / Rennen',
	'long-run': 'Langer Lauf',
	workout: 'Training',
	indoor: 'Indoor',
	commute: 'Pendeln',
};

export const ACTIVITY_TAG_KEYS = Object.keys(ACTIVITY_TAG_LABELS) as ActivityTagKey[];

// Strava workout_type; 0 (run) and 10 (ride) are the default and get no tag.
export const WORKOUT_TYPE_LABELS: Record<number, string> = {
	1: 'Wettkampf',
	2: 'Langer Lauf',
	3: 'Training',
	11: 'Rennen',
	12: 'Training',
};

const WORKOUT_TYPE_TAGS: Record<number, ActivityTagKey> = {
	1: 'race',
	2: 'long-run',
	3: 'workout',
	11: 'race',
	12: 'workout',
};

export const isActivityTagKey = (value: string): value is ActivityTagKey => Object.hasOwn(ACTIVITY_TAG_LABELS, value);

export function getActivityTags(activity: {
	workout_type: number | null;
	trainer: boolean | number | null;
	commute: boolean | number | null;
}): ActivityTag[] {
	const tags: ActivityTag[] = [];
	const workoutTag = activity.workout_type !== null ? WORKOUT_TYPE_TAGS[activity.workout_type] : undefined;
	if (workoutTag) tags.push({ key: workoutTag, label: WORKOUT_TYPE_LABELS[activity.workout_type!] });
	if (activity.trainer) tags.push({ key: 'indoor', label: ACTIVITY_TAG_LABELS.indoor });
	if (activity.commute) tags.push({ key: 'commute', label: ACTIVITY_TAG_LABELS.commute });
	return tags;
}
