'use client';

import { adicionarAoCarrinho } from "@/src/services/cart";

interface Props {
  productId: number;
  userId: number;
  tiitle: string;
  quantidade: number;
  className?: string;
}

export function AddCart({
  productId,
  userId,
  tiitle,
  quantidade,
  className,
}: Props) {
  return (
    <button
      onClick={() => adicionarAoCarrinho(productId, userId, quantidade)}
      className={`
        w-full sm:w-auto px-10 py-4 text-lg font-semibold bg-[#2f61b9] text-white rounded-full shadow-lg shadow-blue-600/30 hover:bg-[#244e96] hover:shadow-blue-700/40 transition animate-pulseGlowBlue
        ${className ?? ''}
      `}
    >
      {tiitle}
    </button>
  );
}