import LayoutDefault from '@/components/LayoutDefault';

export default function MdxLayout({ children }: { children: React.ReactNode }) {
	return <LayoutDefault prose>{children}</LayoutDefault>;
}
