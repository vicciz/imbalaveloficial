import { notFound } from "next/navigation";

import BackButton from "@/src/components/navigation/BackButton";
import { ProductHero } from "@/src/components/produto/layout";
import { buscarProdutoPorId } from "@/src/components/produto/types/produtos";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const produtoId = Number(id);

  if (!Number.isSafeInteger(produtoId) || produtoId < 1) {
    notFound();
  }

  const { data: produto, error } = await buscarProdutoPorId(produtoId, false);

  if (error) {
    throw error;
  }

  if (!produto) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <BackButton label="Voltar" destination="/" />
      <ProductHero produto={produto} />
    </div>
  );
}
