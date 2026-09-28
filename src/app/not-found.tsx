import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/src/components/ui/button";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <section
      className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12 text-center sm:px-6"
      aria-labelledby="not-found-title"
    >
      <Image
        src="/imagens/icons/404-imbalavel.svg"
        alt="Ilustração de uma página não encontrada"
        width={280}
        height={180}
        className="mb-6 h-auto w-full max-w-[220px] sm:max-w-[280px]"
        priority
      />

      <p className="text-6xl font-bold tracking-tight text-zinc-900 sm:text-7xl">
        404
      </p>
      <h1
        id="not-found-title"
        className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl"
      >
        Parece que essa página não existe
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600 sm:text-base">
        O endereço que você acessou não existe ou o conteúdo foi removido.
      </p>

      <Button asChild size="lg" className="mt-8 h-11 px-5">
        <Link href="/">Voltar para a página inicial</Link>
      </Button>
    </section>
  );
}
