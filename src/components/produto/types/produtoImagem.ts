import { supabase } from "../../../../supabaseClient";
//listarImagensProduto(idProduto: number)
export async function listarImagensProduto(
  idProduto: number
) {
  return await supabase
    .from("produto_imagem")
    .select("*")
    .eq("id_produto", idProduto)
    .order("ordem");
}
//adicionarImagem(...)
export async function adicionarImagem(
  idProduto: number,
  caminho: string,
  ordem: number,
  principal = false,
  idValor: number | null = null
) {
  return await supabase
    .from("produto_imagem")
    .insert({
      id_produto: idProduto,
      caminho,
      ordem,
      principal,
      id_valor: idValor,
    });
}
//removerImagem(...)
export async function excluirImagem(
  id: number
) {
  return await supabase
    .from("produto_imagem")
    .delete()
    .eq("id", id);
}
//definirPrincipal(...)
export async function definirImagemPrincipal(
  idProduto: number,
  idImagem: number
) {
  // Remove a principal atual
  await supabase
    .from("produto_imagem")
    .update({ principal: false })
    .eq("id_produto", idProduto);

  // Define a nova principal
  return await supabase
    .from("produto_imagem")
    .update({ principal: true })
    .eq("id", idImagem);
}

export async function uploadImagem(
    file: File
) {

    const extensao =
        file.name.split(".").pop();

    const nome =
        `${Date.now()}-${crypto.randomUUID()}.${extensao}`;

    const caminho =
        `produtos/${nome}`;

    const {
        error
    } =
    await supabase.storage
        .from("produtos")
        .upload(
            caminho,
            file
        );

    if(error){

        return {
            data:null,
            error
        };

    }

    return {

        data:caminho,

        error:null

    };

}

export async function excluirArquivoStorage(
    caminho:string
){

    return await supabase.storage
        .from("produtos")
        .remove([
            caminho
        ]);

}

export async function atualizarOrdem(
    imagens:{
        id:number;
        ordem:number;
    }[]
){

    for(const imagem of imagens){

        await supabase
        .from("produto_imagem")
        .update({

            ordem:
            imagem.ordem

        })
        .eq(
            "id",
            imagem.id
        );

    }

}
