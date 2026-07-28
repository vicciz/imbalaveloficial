import { supabase } from "@/supabaseClient";

export async function obterCategoriaId(
  nome: string
) {

  const categoria =
    nome.trim();

  const {
    data,
  } =
    await supabase

      .from("categorias")

      .select("id")

      .ilike(
        "nome",
        categoria
      )

      .maybeSingle();

  if (data) {

    return data.id;

  }

  const {
    data: criada,
    error,
  } =
    await supabase

      .from("categorias")

      .insert({

        nome:
          categoria,

      })

      .select("id")

      .single();

  if (error) {

    throw error;

  }

  return criada.id;

}