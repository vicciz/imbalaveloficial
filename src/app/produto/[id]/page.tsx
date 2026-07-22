import { ProductHero } from "@/src/components/produto/layout";
import BackButton from "@/src/components/navigation/BackButton";
import { buscarProdutoPorId } from "@/src/components/produto/types/produtos";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { id } = await params;

  const { data: produto, error } =
    await buscarProdutoPorId(Number(id));

  if (error || !produto) {
    return <div>Produto não encontrado.</div>;
  }

  return (
    <div className="space-y-4">
      <BackButton
        label="Voltar"
        destination="/"
      />
      <ProductHero produto={produto} />
    </div>
  );
}