import { getActiveDataSourceLabel, isMockDataSource } from '@/lib/projects/github-stars/dataClient';

const isProduction = process.env.NODE_ENV === 'production';

export function DataSourceIndicator() {
	if (isProduction) {
		return null;
	}

	const mockActive = isMockDataSource();
	const label = getActiveDataSourceLabel();

	return (
		<div
			className={`fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs shadow-lg ${
				mockActive
					? 'border-amber-500/50 bg-amber-100/90 text-amber-900'
					: 'border-emerald-500/50 bg-emerald-100/90 text-emerald-900'
			}`}
		>
			<span className="font-semibold">Datenquelle:</span>
			<span>{label}</span>
			<span className="rounded-full border border-current px-2 py-0.5 text-[10px] tracking-wide uppercase">
				USE_FAKE_API={mockActive ? 'true' : 'false'}
			</span>
		</div>
	);
}
