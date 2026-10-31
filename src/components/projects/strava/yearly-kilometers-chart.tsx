'use client';

import { useId } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { YearlyKilometers } from '@/lib/strava/db';

const chartConfig = {
	kilometers: {
		label: 'Kilometer',
		color: '#ef7c17',
	},
} satisfies ChartConfig;

const integerFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const listFormat = new Intl.ListFormat('de-DE', { type: 'conjunction' });

type Props = {
	title: string;
	sportTypes: readonly string[];
	data: YearlyKilometers[];
};

export function YearlyKilometersChart({ title, sportTypes, data }: Props) {
	const headingId = useId();
	const total = data.reduce((sum, d) => sum + d.kilometers, 0);

	return (
		<section
			aria-labelledby={headingId}
			className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700"
		>
			<header className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
				<div>
					<h2 id={headingId} className="text-lg font-semibold">
						{title}: Kilometer pro Jahr
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Summe aller Aktivitäten vom Typ {listFormat.format(sportTypes.map((t) => `„${t}“`))}
					</p>
				</div>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Gesamt:{' '}
					<span className="font-semibold text-gray-900 tabular-nums dark:text-white">
						{integerFormat.format(total)} km
					</span>
				</p>
			</header>

			{data.length === 0 ? (
				<p className="py-8 text-center text-gray-600 dark:text-gray-400">Keine Aktivitäten vorhanden.</p>
			) : (
				<ChartContainer config={chartConfig} className="aspect-auto h-72 w-full sm:h-80">
					<BarChart accessibilityLayer data={data} margin={{ top: 8 }}>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={10} />
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									formatter={(value, _name, item) => (
										<div className="flex w-full flex-col gap-1">
											<div className="flex items-center justify-between gap-4">
												<span className="text-gray-500 dark:text-gray-400">Kilometer</span>
												<span className="font-mono font-medium tabular-nums">
													{integerFormat.format(Number(value))} km
												</span>
											</div>
											<div className="flex items-center justify-between gap-4">
												<span className="text-gray-500 dark:text-gray-400">Aktivitäten</span>
												<span className="font-mono font-medium tabular-nums">
													{integerFormat.format(
														(item.payload as YearlyKilometers).activities,
													)}
												</span>
											</div>
										</div>
									)}
								/>
							}
						/>
						<Bar dataKey="kilometers" fill="var(--color-kilometers)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ChartContainer>
			)}
		</section>
	);
}
