import { supabase } from "@/supabaseClient";

export async function obterFornecedorId(
  nome: string
) {

  const fornecedor =
    nome.trim();


  const {
    data,
    error,
  } =
    await supabase

      .from("fornecedores")

      .select("id")

      .ilike(
        "nome",
        fornecedor
      )

      .maybeSingle();


  if (error) {

    throw error;

  }


  if (data) {

    return data.id;

  }


  const {
    data: criado,
    error: erroCriar,
  } =
    await supabase

      .from("fornecedores")

      .insert({

        nome:
          fornecedor,

      })

      .select("id")

      .single();


  if (erroCriar) {

    throw erroCriar;

  }


  return criado.id;

}