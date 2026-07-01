'use client';

import { useState } from "react";

export default function CheckoutPagamento() {
  const [step, setStep] = useState(1);

  const [cliente, setCliente] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: ""
  });

  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    cidade: "",
    bairro: "",
    cep: ""
  });

  function handleClienteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  function handleEnderecoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep(3);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {step === 1 && (
        <form onSubmit={handleClienteSubmit}>
          <h2>Dados do Cliente</h2>
          <input placeholder="Nome" />
          <input placeholder="SobreNome"/>
          <input placeholder="Email" />
          <input placeholder="Telefone"/>
          <button type="submit">Continuar</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleEnderecoSubmit}>
          <h2>Endereço</h2>
          <input placeholder="Rua" />
          <input placeholder="Cidade" />
          <input placeholder="Bairro"/>
          <input placeholder="Cep"/>
          <button type="submit">Continuar</button>
        </form>
      )}

      {step === 3 && (
        <div>
          <h2>Opções de Pagamento</h2>
          <button>Pix</button>
          <button>Débito</button>
          <button>Crédito</button>
        </div>
      )}
    </div>
  );
}
