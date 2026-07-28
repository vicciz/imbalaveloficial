import { supabase } from "@/supabaseClient";

export async function obterMarcaId(
  nome: string
) {

  const marca =
    nome.trim();

  const {
    data,
  } =
    await supabase

      .from("marca")

      .select("id")

      .ilike(
        "nome",
        marca
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

      .from("marca")

      .insert({

        nome: marca,

        ativo: true,

      })

      .select("id")

      .single();

  if (error) {

    throw error;

  }

  return criada.id;

}