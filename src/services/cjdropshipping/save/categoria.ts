import { supabase } from "@/supabaseClient";

export async function salvarCategoria(nome: string) {

 const categoriaNome = nome
   .split(">")
   .pop()
   ?.trim();

 const {data: existente} = await supabase
   .from("categorias")
   .select("id")
   .eq("nome", categoriaNome)
   .single();


 if(existente){
    return existente.id;
 }


 const {data, error} = await supabase
   .from("categorias")
   .insert({
      nome: categoriaNome
   })
   .select()
   .single();


 if(error){
    console.error(error);
    throw error;
 }


 return data.id;
}