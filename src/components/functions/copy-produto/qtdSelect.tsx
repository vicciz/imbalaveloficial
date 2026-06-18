'use client';

import { useState } from 'react';

interface QuantidadeSelectorProps {
  min?: number;
  max?: number;
  initialValue?: number;
  onChange?: (value: number) => void;
}

export default function QuantidadeSelector({
  min = 1,
  max = 30,
  initialValue = 1,
  onChange,
}: QuantidadeSelectorProps) {
  const [quantidade, setQuantidade] = useState(initialValue);

  const diminuir = () => {
    if (quantidade > min) {
      const novoValor = quantidade - 1;
      setQuantidade(novoValor);
      onChange?.(novoValor);
    }
  };

  const aumentar = () => {
    if (quantidade < max) {
      const novoValor = quantidade + 1;
      setQuantidade(novoValor);
      onChange?.(novoValor);
    }
  };

  return (
    <div className="flex items-center m-4 border-2 border-purple-500 rounded-full overflow-hidden w-fit">
      <button
        onClick={diminuir}
        className="px-4 py-2 text-red-500 text-xl font-bold hover:bg-gray-100 transition"
      >
        −
      </button>

      <span className="px-6 py-2 font-semibold text-gray-700 min-w-[50px] text-center">
        {quantidade}
      </span>

      <button
        onClick={aumentar}
        className="px-4 py-2 text-purple-500 text-xl font-bold hover:bg-gray-100 transition"
      >
        +
      </button>
    </div>
  );
}