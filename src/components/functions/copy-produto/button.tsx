'use client';

interface Props {
  productId: number;
  link: string;
  className?: string; // 👈 ADICIONA ISSO
}

export function ComprarButton({ productId, link, className }: Props) {
  return (
    <a
      href={link}
      target="_blank"
      className={`
        bg-red-600 text-white font-bold rounded
        hover:brightness-110 transition
        ${className ?? ''}
      `}
    >
      Comprar agora
    </a>
  );
}
