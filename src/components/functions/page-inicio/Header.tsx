'use client';

import CarrinhoP from "@/src/app/carrinho/page";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  nome: string;
  role?: 'admin' | 'user' | string;
  email?: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [hasProdutoHero, setHasProdutoHero] = useState(false);
  const pathname = usePathname();
  const isProdutoPage = pathname?.startsWith('/produto');
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      const normalizedEmail = parsedUser.email?.toLowerCase();
      const rawRole = parsedUser.role?.toString().toLowerCase();
      const normalizedRole = rawRole === 'admin' || rawRole === 'sim' || (normalizedEmail && adminEmails.includes(normalizedEmail)) ? 'admin' : 'user';
      const normalizedUser = { ...parsedUser, role: normalizedRole };
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    }
  }, []);

  useEffect(() => {
    if (!isProdutoPage) {
      setHasProdutoHero(false);
      setShowHeader(true);
      return;
    }

    const hero = document.getElementById('produto-hero');
    if (!hero) {
      setHasProdutoHero(false);
      setShowHeader(true);
      return;
    }

    setHasProdutoHero(true);
    setShowHeader(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowHeader(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);

    return () => observer.disconnect();
  }, [isProdutoPage]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur border-b border-black/10 transition-transform duration-300 ease-out ${
          showHeader ? 'translate-y-0' : '-translate-y-full pointer-events-none'
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-zinc-900">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          IMBALÁVEL
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6">
          <Link href="/" className="text-lg font-medium hover:underline">
            Produtos
          </Link>
          <Link href="/rastrear" className="text-lg font-medium hover:underline">
            Rastrear
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-lg font-medium text-indigo-400 hover:underline">
              Administração
            </Link>
            
          )}
          <Link href="/carrinho" className="text-lg font-medium hover:underline">
            Minhas Compras
          </Link>
        </div>

        {/* Desktop actions */}
        <nav className="hidden md:flex gap-3 text-sm">
          {!user ? (
            <>
              <Link href="/login" className="px-4 py-2 rounded-full bg-[#2f61b9] text-white shadow-lg shadow-blue-600/25 hover:bg-[#244e96] transition">
                Entrar
              </Link>
              <Link href="/cadastro" className="px-4 py-2 rounded-full border border-blue-200 text-[#23446d] bg-white/80 hover:bg-[#f3f7ff] transition">
                Criar conta
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-full border border-blue-200 text-[#23446d] bg-white/80 hover:bg-[#f3f7ff] transition"
            >
              Sair
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded border border-black/20"
          aria-label="Abrir menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="block w-5 h-0.5 bg-zinc-900 mb-1" />
          <span className="block w-5 h-0.5 bg-zinc-900 mb-1" />
          <span className="block w-5 h-0.5 bg-zinc-900" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 sm:px-6 pb-4 text-zinc-900 border-t border-black/10">
          <div className="flex flex-col gap-3 pt-3">
            <Link href="/" className="text-base font-medium hover:underline" onClick={() => setMenuOpen(false)}>
              Produtos
            </Link>
            <Link href="/rastrear" className="text-base font-medium hover:underline" onClick={() => setMenuOpen(false)}>
              Rastrear
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-base font-medium text-indigo-400 hover:underline" onClick={() => setMenuOpen(false)}>
                Administração
              </Link>
            )}
            <div className="flex gap-3 pt-2">
              {!user ? (
                <>
                  <Link href="/login" className="px-4 py-2 rounded-full bg-[#2f61b9] text-white shadow-lg shadow-blue-600/25 hover:bg-[#244e96] transition" onClick={() => setMenuOpen(false)}>
                    Entrar
                  </Link>
                  <Link href="/cadastro" className="px-4 py-2 rounded-full border border-blue-200 text-[#23446d] bg-white/80 hover:bg-[#f3f7ff] transition" onClick={() => setMenuOpen(false)}>
                    Criar conta
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-4 py-2 rounded-full border border-blue-200 text-[#23446d] bg-white/80 hover:bg-[#f3f7ff] transition"
                >
                  Sair
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </header>
      <div
        className={`transition-[height] duration-300 ease-out ${
          hasProdutoHero && showHeader ? 'h-[72px]' : 'h-0'
        }`}
        aria-hidden="true"
      />
    </>
  );
}
