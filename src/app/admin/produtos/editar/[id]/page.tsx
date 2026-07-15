import { AdminLayout } from "@/src/components/layout/Admin";
import FormProduto from "@/src/components/forms/gerenciamentoProduto";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarProdutoPage({
  params,
}: Props) {
  const { id } = await params;

  return (
    <AdminLayout>
      <FormProduto
        modo="editar"
        produtoId={Number(id)}
      />
    </AdminLayout>
  );
}