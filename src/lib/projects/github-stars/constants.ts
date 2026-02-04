export type SortOption =
	| 'starred-desc'
	| 'starred-asc'
	| 'updated-desc'
	| 'updated-asc'
	| 'name-asc'
	| 'name-desc'
	| 'stars-desc'
	| 'stars-asc';

export const SORT_OPTION_LABELS: Record<SortOption, string> = {
	'starred-desc': 'Zuletzt hinzugefügt (neueste Sterne)',
	'starred-asc': 'Zuletzt hinzugefügt (älteste Sterne)',
	'updated-desc': 'Zuletzt aktualisiert (neueste)',
	'updated-asc': 'Zuletzt aktualisiert (älteste)',
	'name-asc': 'Name (A–Z)',
	'name-desc': 'Name (Z–A)',
	'stars-desc': 'Sterne (absteigend)',
	'stars-asc': 'Sterne (aufsteigend)',
};

export const MIN_QUERY_LENGTH = 3;
export const INITIAL_VISIBLE_COUNT = 10;
