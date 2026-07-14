import ProductHero from "@/src/app/produto/componentes/produto/ProductHero";
import { buscarProdutoPorId } from "@/src/services/produtos";

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

  return <ProductHero produto={produto} />;
}