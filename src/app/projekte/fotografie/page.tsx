import Image from 'next/image';
import type { Metadata } from 'next';
import LayoutDefault from '@/components/LayoutDefault';

export const metadata: Metadata = {
	title: 'Fotografie',
};

const pictureList = [
	{ image: 'BqVL5i0lEjE.jpg', desc: 'Weinberge bei Sonnenaufgang, November 2018' },
	{ image: 'Ba2EazjHbKX.jpg', desc: 'Weinberge im Sonnenuntergang, Oktober 2017' },
	{ image: 'BZYM9BXnE4o.jpg', desc: 'Weinberge in der Morgen-Sonne, September 2017' },
	{ image: 'CDd2iBnlmo8.jpg', desc: 'Zugspitze im Sonnenuntergang, Juli 2020' },
	{ image: 'CDgafaGlCWO.jpg', desc: 'Berg-Panorama, Grubigstein, Juli 2020' },
	{ image: 'CDrDB1CljIU.jpg', desc: 'Seebensee mit Zugspitze, Juli 2020' },
];

export default async function Page() {
	return (
		<LayoutDefault prose fullWidth>
			<h1>Fotografie</h1>

			<ul className="not-prose">
				{pictureList.map((project, index) => (
					<li key={index} className="flex flex-col pl-0! mb-8 md:items-center">
						<Image
							src={`/projekte/fotografie/${project.image}`}
							alt={project.desc}
							width={800}
							height={600}
							className="my-0! h-auto w-full rounded-md border-8 border-gray-200"
						/>
						<p className="text-base mt-2">{project.desc}</p>
					</li>
				))}
			</ul>
		</LayoutDefault>
	);
}
