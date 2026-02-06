import type { Metadata } from 'next';
import Link from 'next/link';
import LayoutDefault from '@/components/LayoutDefault';

export const metadata: Metadata = {
	title: 'Mein twitter Archiv',
};

export default async function Page() {
	const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];

	// Anzahl der Tweets pro Jahr. Ausgelesen per Browser-Console via `$$('main blockquote').length`
	const tweetsPerYear = [10, 725, 892, 833, 959, 870, 1182, 1060, 1012, 995, 991, 991, 747, 831, 649];

	const linksForYears = years.map((year) => ({
		href: `/projekte/tweets/tweets-${year}`,
		label: `${year}`,
	}));

	return (
		<LayoutDefault prose fullWidth>
			<h1>Mein twitter Archiv</h1>

			<p>
				Übersicht meiner Tweets vom Beginn der Nutzung 2009 bis zum Ende durch den Verkauf der Plattform an
				Elon.
			</p>
			<p>
				Hinweis: Die Links zum originalen Tweet funktionieren nicht mehr, da ich meinen Twitter Account zwar
				immer noch habe, aber die Tweets nicht mehr öffentlich auf der Plattform zugänglich sind.
			</p>

			<ol className="my-8 grid grid-cols-2 lg:grid-cols-3 gap-x-8 marker:text-base! lg:my-0">
				{linksForYears.map(({ href, label }) => (
					<li key={`${href}${label}`}>
						<Link
							href={href}
							className="hover:shadow-linkhover dark:hover:text-darkblue py-1 text-xl font-bold tracking-wider transition-all duration-150 ease-linear sm:px-1"
						>
							{label}
						</Link>
						<span className="block sm:inline text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-0 sm:ml-2">
							({tweetsPerYear[years.indexOf(parseInt(label))] || 0} Tweets)
						</span>
					</li>
				))}
			</ol>
		</LayoutDefault>
	);
}
