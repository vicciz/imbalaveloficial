import Link from "next/link";
import Image from "next/image";
import HeaderAccount from "./HeaderAccount";
import logoIcon from "@/public/imagens/icons/logo.png";
import HeaderSearch from "./HeaderSearch";
import HeaderNavigation from "./HeaderNavigation";
import HeaderDelivery from "./HeaderDelivery";
import HeaderCart from "./HeaderCart";
import type { HeaderUser } from "@/src/hooks/useHeaderUser";

interface HeaderDesktopProps {
  user: HeaderUser | null;
  logout: () => Promise<void>;
}

export default function HeaderDesktop({ user, logout }: HeaderDesktopProps) {
  return (
<header
  className="sticky top-0 z-50 shadow-lg"
  style={{
    background: "linear-gradient(90deg, #3C1B8B 0%, #60469C 58%, #3C1B8B 100%)",
  }}
>
      {/* Linha principal */}
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-5 h-16">

        {/* Logo + endereço de entrega */}
        <Link href="/" className="flex items-center gap-2.5 text-white shrink-0 min-w-0">
          <Image
            src={logoIcon}
            alt=""
            width={80}
        />
            
        </Link>
        <HeaderDelivery user={user} />

        {/* Barra de busca */}
        <div className="flex-1">
          <HeaderSearch />
        </div>

        {/* Conta + carrinho */}
        <div className="flex items-center gap-4 shrink-0 text-white">
          <HeaderAccount
            user={user}
            logout={logout}
          />
          <HeaderCart />
        </div>
      </div>

      {/* Linha de navegação */}
      <HeaderNavigation />
    </header>
  );
}