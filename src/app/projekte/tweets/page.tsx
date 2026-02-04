import type { Metadata } from 'next';
import Link from 'next/link';
import LayoutDefault from '@/components/LayoutDefault';

export const metadata: Metadata = {
	title: 'tweets Übersicht',
};

export default async function Page() {
	const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];

	const linksForYears = years.map((year) => ({
		href: `/projekte/tweets/tweets-${year}`,
		label: `${year}`,
	}));

	return (
		<LayoutDefault prose fullWidth>
			<h1>twitter Archiv</h1>

			<p>
				Übersicht meiner Tweets vom Beginn der Nutzung 2009 bis zum Ende durch den Verkauf der Plattform an
				Elon.
			</p>
			<ol className="m-auto my-8 lg:my-0">
				{linksForYears.map(({ href, label }) => (
					<li key={`${href}${label}`}>
						<Link
							href={href}
							className="hover:shadow-linkhover dark:hover:text-darkblue px-4 py-1 text-xl font-bold tracking-wider transition-all duration-150 ease-linear sm:px-1"
						>
							{label}
						</Link>
					</li>
				))}
			</ol>
		</LayoutDefault>
	);
}
