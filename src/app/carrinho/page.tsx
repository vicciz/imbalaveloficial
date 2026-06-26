"use client";

import { useEffect, useState } from "react";
import {
  buscarCarrinho,
  removerDoCarrinho,
} from "@/src/services/cart";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function CarrinhoP() {
   const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  async function carregar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } =
    await buscarCarrinho(user.id);

setCartItems(data || []);
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setCartItems(data || []);
    setLoading(false);
  }

  carregar();
}, []);
  const finalizarCompra = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Faça login para finalizar a compra.");
        return;
      }

      const response = await fetch(
        "/api/checkout-carrinho",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        alert(data.error || "Erro ao criar checkout");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Erro ao finalizar compra");
    }
  };

  async function handleRemover(id: number) {
    const ok = await removerDoCarrinho(id);

    if (ok) {
      setCartItems((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }
  }

  const total = cartItems.reduce(
    (acc, item) =>
      acc +
      Number(item.produto.preco) *
        Number(item.quantidade),
    0
  );
  if (loading) {
    return (
      <main className="p-8">
        <h1>Carregando carrinho...</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div>
        <button
      type="button"
      onClick={() =>
        router.push("/pedidos")
      }
    >
      Ver Pedidos
    </button>
      </div>
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          Carrinho de Compras
        </h1>

        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "2fr 1fr",
          }}
        >
          {/* Produtos */}
          <div>
            {cartItems.length === 0 ? (
              <div
                style={{
                  padding: "1.5rem",
                  background: "#fff",
                  borderRadius: "8px",
                }}
              >
                Seu carrinho está vazio.
              </div>
            ) : (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "1.5rem",
                }}
              >
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: "1.1rem",
                        }}
                      >
                        {item.produto.nome}
                      </strong>

                      <div
                        style={{
                          color: "#666",
                          marginTop: "0.25rem",
                        }}
                      >
                        Quantidade: {item.quantidade}
                      </div>

                      <div
                        style={{
                          color: "#888",
                          fontSize: ".9rem",
                          marginTop: "4px",
                        }}
                      >
                        Valor unitário:{" "}
                        {formatCurrency(
                          Number(item.produto.preco)
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                        }}
                      >
                        {formatCurrency(
                          Number(item.produto.preco) *
                            Number(item.quantidade)
                        )}
                      </div>

                      <button
                        onClick={() =>
                          handleRemover(item.id)
                        }
                        style={{
                          marginTop: "10px",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          padding:
                            "0.45rem 0.8rem",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumo */}
          <aside
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.05)",
              height: "fit-content",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                marginBottom: "1rem",
              }}
            >
              Resumo do Pedido
            </h2>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <span>Subtotal</span>
              <span>
                {formatCurrency(total)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <span>Frete</span>
              <span>{formatCurrency(0)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              <span>Total</span>
              <span>
                {formatCurrency(total)}
              </span>
            </div>

            <button
              style={{
                width: "100%",
                marginTop: "1.5rem",
                padding: "0.85rem",
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={finalizarCompra}
            >
              Finalizar Compra
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}