import Link from "next/link";
import Image from "next/image";
import userIcon from "@/public/imagens/icons/perfil.png";
import type { HeaderUser } from "@/src/hooks/useHeaderUser";

interface Props {
  user: HeaderUser | null;
  logout: () => Promise<void>;
}

export default function HeaderAccount({ user, logout }: Props) {
  async function handleLogout(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    e.stopPropagation();
    await logout();
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <Link
        href={user ? "/perfil" : "/auth/login"}
        className="
          flex items-center
          gap-2
          h-11
          px-3
          rounded-full
          border border-white/20
          bg-white/10
          hover:bg-white/15
          transition
        "
      >
        <Image
          src={userIcon}
          alt=""
          width={50}
          height={50}
          className="shrink-0"
        />

        <div className="leading-none">
          <p className="text-[5px] text-white/70">
            {user ? "Bem-vindo!" : "Minha conta"}
          </p>

          <p className="text-[10px] font-semibold text-white">
            {user ? user.nome.split(" ")[0] : "Entrar"}
          </p>
        </div>
      </Link>

      {user && (
        <button
          onClick={handleLogout}
          className="text-[11px] text-white/70 hover:text-white transition"
        >
          Sair
        </button>
      )}
    </div>
  );
}