"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { buscarPedidosUsuario } from "@/src/services/pedido/pedido";
import { BackButton } from "@/src/navigation";

export default function Pedido() {
  const [pedidos, setPedidos] = useState<any[]>([]);

useEffect(() => {
  async function carregar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } =
      await buscarPedidosUsuario(user.id);

    if (error) {
      console.error(error);
      return;
    }

    console.log(data);
    console.log(JSON.stringify(data, null, 2));
    setPedidos(data ?? []);
  }

  carregar();
}, []);

  return (
  <div>
    <BackButton
      label="Minha conta"
      destination="/perfil"
      className="mb-4"
    />

    {pedidos.map((pedido) => (
      <div key={pedido.id}>
        <h3>Pedido #{pedido.id}</h3>
        <p>Total: R$ {pedido.valorTotal}</p>
        <p>Status: {pedido.status}</p>
        <p>Data de Criação: {pedido.created_at}</p>

        {pedido.pedidoItem?.map((item: any) => (
      <div key={item.produto.id}>
        {item.produto.image && (
        <img
          src={item.produto.image}
          alt={item.produto.nome}
          width={80}
        />
      )}
        <p>{item.produto.nome}</p>
        <p>Quantidade: {item.quantidade}</p>
        <p>R$ {item.produto.preco}</p>
        <img></img>
      </div>
    ))}
      </div>
    ))}

  </div>

  );
}