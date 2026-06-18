'use client';

import Link from 'next/link';
import { AddCart } from './addCart';

interface ProdutoProps {
  id: number;
  nome: string;
  preco: string;
  link: string;
  rating: string;
  reviews: number;
  image: string;
  image1: string;
  image2: string;
  image3: string;
  category: string;
  descricao: string;
  details: string;
  fornecedor?: string;
}

export default function Produtos({
  id,
  nome,
  preco,
  link,
  rating,
  reviews,
  image,
  image1,
  image2,
  image3,
  category,
  descricao,
  details,
  fornecedor
  
}: ProdutoProps) {

const imageUrl = image
  ? `http://localhost/api/uploads/${encodeURIComponent(image)}`
  : `http://localhost/api/uploads/placeholder.png`;

  return (
    <div className="w-1/3 bg-gray-50 rounded-xl p-4 flex flex-col items-center">
      
      <img
          src={imageUrl}
          alt={nome}
          className="w-full h-40 object-cover rounded mb-2"
      />

      <h3 className="text-md font-bold">{nome}</h3>
      <p className="text-sm text-gray-600 mb-1">{descricao}</p>
      <div className="flex items-center gap-2 mb-1">
        
      </div>
      <p className="text-sm text-gray-500">⭐ {rating} ({reviews})</p>

      <div className="flex gap-2 mt-2">
        {/* Botão Comprar redireciona para página do produto */}
        <Link href={`/produto/${id}`}>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Comprar
          </button>
        </Link>

        {/* Botão adicionar ao carrinho */}
        
      <button></button>
      </div>
    </div>
  );
}
