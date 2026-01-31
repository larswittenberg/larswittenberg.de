import Link from 'next/link';
import type { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';

export const metadata: Metadata = {
	title: 'Projekte',
};

const projectList = [
	{
		name: 'Meine GitHub Stars',
		href: '/projekte/github-stars',
		description: 'Eine Übersicht meiner mit einem Stern markierten GitHub-Repositories.',
	},
];

export default async function Page() {
	return (
		<LayoutDefault prose>
			<h1>Projekte</h1>

			<ul className="space-y-8 pl-0!">
				{projectList.map((project) => (
					<li key={project.name} className="flex flex-col md:flex-row md:items-center md:space-x-6">
						<div>
							<h2 className="mb-2 text-2xl font-semibold">
								<Link href={project.href} className="hover:underline">
									{project.name}
								</Link>
							</h2>
							<p className="text-gray-700 dark:text-gray-300">{project.description}</p>
						</div>
					</li>
				))}
			</ul>
		</LayoutDefault>
	);
}
