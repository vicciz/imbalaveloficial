'use client';

import { useEffect, useState } from 'react';
import Client from '@/src/components/Admin/common/Perfil';
import { BackButton } from '@/src/navigation';

interface User {
  id: number;
  nome: string;
  email: string;
  endereco?: string;
  image?: string;
}

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');

    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  if (!user) {
    return <p className="p-6">Usuário não logado</p>;
  }

  return (
    <div className="p-6">
      <BackButton
        label="Minha conta"
        destination="/pedidos"
        className="mb-4"
      />

      <h1 className="text-2xl font-bold mb-4">Perfil do Usuário</h1>

      <Client
        id={user.id}
        nome={user.nome}
        email={user.email}
        endereco={user.endereco ?? 'Não informado'}
        image={user.image ?? 'default.png'}
      />
    </div>
  );
}
