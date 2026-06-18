'use client';

import { useEffect, useState } from "react";

export function Cronometro() {
  const [contador, setContador] = useState(3600); // 1 hora

  useEffect(() => {
    const timer = setInterval(() => {
      setContador(prev => (prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;

    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-red-600 text-white font-bold px-4 py-2 rounded w-max">
      Oferta expira em: {formatTempo(contador)}
    </div>
  );
}
