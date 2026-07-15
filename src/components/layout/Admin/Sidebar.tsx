import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <nav className="p-4">
        <Link href="/admin" className="block rounded-lg px-4 py-3 hover:bg-slate-100">
          Dashboard
        </Link>
        <Link href="/admin/produtos" className="block rounded-lg px-4 py-3 hover:bg-slate-100">
          Produtos
        </Link>
        <Link href="/admin/pedidos" className="block rounded-lg px-4 py-3 hover:bg-slate-100">
          Pedidos
        </Link>
      </nav>
    </aside>
  );
}