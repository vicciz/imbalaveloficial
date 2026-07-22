import Link from "next/link";

export default function HeaderNavigation() {
  return (
    <nav className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-9">
        <Link
          href="/produtos"
          className="text-white text-sm font-medium opacity-90 hover:opacity-100 transition-opacity"
        >
          Produtos
        </Link>

        <Link
          href="/pedidos"
          className="text-white text-sm font-medium opacity-90 hover:opacity-100 transition-opacity"
        >
          Meus pedidos
        </Link>

        <a
          href="https://wa.me/5541999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 border border-white/30 text-white text-xs font-medium px-3 py-1 rounded-full hover:bg-white/10 transition-colors"
        >
          WhatsApp ©
        </a>
      </div>
    </nav>
  );
}