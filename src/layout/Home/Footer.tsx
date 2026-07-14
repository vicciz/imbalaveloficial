import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white/90 backdrop-blur border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 text-zinc-700">

        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-widest text-zinc-900">
            IMBALÁVEL
          </h2>

          <p className="mt-4 text-sm leading-relaxed">
            Curadoria premium dos melhores perfumes masculinos, fragrâncias marcantes
            e cosméticos selecionados para homens que se impõem.
          </p>

          <p className="mt-6 text-xs text-zinc-500">
            © {new Date().getFullYear()} Imbalável. Todos os direitos reservados.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            Institucional
          </h3>

          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/sobre-nos" className="hover:text-zinc-900 transition">
                Sobre nós
              </Link>
            </li>
            <li>
              <Link href="/termos" className="hover:text-zinc-900 transition">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="hover:text-zinc-900 transition">
                Política de Privacidade
              </Link>
            </li>
           
          </ul>
        </div>

        {/* SOCIAL + SEO */}
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            Conecte-se
          </h3>

          <p className="text-sm mb-4">
            Acompanhe novidades, lançamentos e recomendações exclusivas de perfumes masculinos.
          </p>

          <div className="flex gap-4 text-sm">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500 transition"
            >
              Instagram
            </Link>

            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition"
            >
              Facebook
            </Link>

            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition"
            >
              Twitter
            </Link>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-black/10 py-4 text-center text-xs text-zinc-500">
        Perfumes masculinos • Fragrâncias premium • Curadoria IMBALÁVEL
      </div>
    </footer>
  );
}
