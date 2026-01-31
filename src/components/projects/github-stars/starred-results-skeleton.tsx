export function StarredResultsSkeleton() {
	return (
		<div className="space-y-4">
			<div className="bg-muted h-4 w-48 animate-pulse rounded" />
			<ul className="space-y-4">
				{Array.from({ length: 3 }).map((_, index) => (
					<li key={index} className="border-border space-y-3 rounded-lg border p-4">
						<div className="bg-muted h-5 w-56 animate-pulse rounded" />
						<div className="bg-muted h-4 w-full animate-pulse rounded" />
						<div className="flex gap-2">
							<div className="bg-muted h-4 w-16 animate-pulse rounded-full" />
							<div className="bg-muted h-4 w-20 animate-pulse rounded-full" />
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
