import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="w-full border-t border-white/10 backdrop-blur"
      style={{
        background:
          "linear-gradient(90deg, #39393d 0%, #1e1d1f 58%, #171618 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 text-white">

        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-widest text-white">
            IMBALÁVEL
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Curadoria premium dos melhores perfumes masculinos, fragrâncias
            marcantes e cosméticos selecionados para homens que se impõem.
          </p>

          <p className="mt-6 text-xs text-white/40">
            © {new Date().getFullYear()} Imbalável. Todos os direitos reservados.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Institucional
          </h3>

          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link
                href="/sobre-nos"
                className="hover:text-white transition-colors"
              >
                Sobre nós
              </Link>
            </li>

            <li>
              <Link
                href="/termos"
                className="hover:text-white transition-colors"
              >
                Termos de Uso
              </Link>
            </li>

            <li>
              <Link
                href="/privacidade"
                className="hover:text-white transition-colors"
              >
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>

        {/* SOCIAL + SEO */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Conecte-se
          </h3>

          <p className="text-sm mb-4 text-white/70">
            Acompanhe novidades, lançamentos e recomendações exclusivas de
            perfumes masculinos.
          </p>

          <div className="flex gap-4 text-sm text-white/70">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition-colors"
            >
              Instagram
            </Link>

            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              Facebook
            </Link>

            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition-colors"
            >
              Twitter
            </Link>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        Perfumes masculinos • Fragrâncias premium • Curadoria IMBALÁVEL
      </div>
    </footer>
  );
}