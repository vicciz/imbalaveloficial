import Link from "next/link";
import type { HeaderUser } from "@/src/hooks/useHeaderUser";

interface Props {
  user: HeaderUser | null;
}

export default function HeaderDelivery({ user }: Props) {
  return (
    <Link
      href={user ? "/perfil/endereco" : "/auth/login"}
      className="flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
    >

      <div className="leading-tight">
        {user ? (
          <>
            <p className="text-sm font-semibold">
              Entregar para {user.nome.split(" ")[0]}
            </p>

            <p className="text-[11px] text-white/70">
              {user.endereco || "Cadastrar endereço"}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">
              Entregar em
            </p>

            <p className="text-[11px] text-white/70">
              Informe seu CEP
            </p>
          </>
        )}
      </div>
    </Link>
  );
}