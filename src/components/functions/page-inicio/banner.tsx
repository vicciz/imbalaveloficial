'use client';

interface BannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: '@\src\public\boticario.png';
}

export default function Banner({ title, subtitle, imageUrl }: BannerProps) {
  return (
    <div
      className="w-1% h-64 md:h-80 lg:h-96 flex items-center justify-center text-center text-white rounded-xl overflow-hidden relative m-4"
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay escuro para melhorar contraste do texto */}
      <div className="absolute inset-0 bg-black bg-opacity-40">backgroundImage</div>

      <div className="relative z-10 px-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">{title}</h1>
        {subtitle && (
          <p className="text-sm md:text-lg text-gray-200">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
