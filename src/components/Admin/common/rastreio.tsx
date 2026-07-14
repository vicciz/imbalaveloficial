'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TrackingStep {
  status: string;
  description: string;
  date: string;
  icon: string;
}

export default function Rastreio() {
  const [trackingCode, setTrackingCode] = useState('');
  const [showTracking, setShowTracking] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<'correios' | 'loggi' | 'jadlog' | null>(null);

  // Dados de exemplo de rastreamento
  const trackingData: Record<string, TrackingStep[]> = {
    'IM123456789BR': [
      {
        status: 'Entregue',
        description: 'Pacote entregue ao destinatário',
        date: '22 de Fev, 14:30',
        icon: '✓'
      },
      {
        status: 'Saiu para entrega',
        description: 'Pacote saiu do centro de distribuição local',
        date: '22 de Fev, 08:00',
        icon: '🚚'
      },
      {
        status: 'Em trânsito',
        description: 'Pacote em trânsito para sua região',
        date: '21 de Fev, 16:45',
        icon: '📦'
      },
      {
        status: 'Postado',
        description: 'Pacote coletado e postado',
        date: '20 de Fev, 10:15',
        icon: '📤'
      }
    ]
  };

  const handleTrack = () => {
    if (trackingCode.trim()) {
      setShowTracking(true);
    }
  };

  const tracking = trackingData[trackingCode] || null;
  const isDelivered = tracking && tracking[0].status === 'Entregue';

  const carriers = [
    {
      id: 'correios',
      name: 'Correios',
      logo: '📮',
      link: 'https://rastreamento.correios.com.br',
      description: 'Rastreie suas encomendas pelos Correios',
      color: 'yellow'
    },
    {
      id: 'loggi',
      name: 'Loggi',
      logo: '🚀',
      link: 'https://www.loggi.com/track',
      description: 'Rastreie suas encomendas pela Loggi',
      color: 'green'
    },
    {
      id: 'jadlog',
      name: 'Jadlog',
      logo: '📫',
      link: 'https://www.jadlog.com.br/rastreamento',
      description: 'Rastreie suas encomendas pela Jadlog',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 p-6">
      <div className="max-w-5xl mx-auto pt-20">
        {/* Seção Principal de Rastreamento */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Rastreie seu Pedido</h1>
          <p className="text-zinc-600 mb-8 text-lg">
            Acompanhe o status do seu pedido em tempo real
          </p>

          {/* Input de Rastreamento */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl border border-indigo-200 mb-8">
            <label className="block text-sm font-semibold mb-3">Código de Rastreamento</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                placeholder="Ex: IM123456789BR"
                className="flex-1 px-4 py-3 bg-white border border-black/10 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleTrack}
                className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold transition"
              >
                Rastrear
              </button>
            </div>
          </div>

          {/* Resultado do Rastreamento */}
          {showTracking && tracking && (
            <div className="bg-white p-8 rounded-xl border border-black/10 mb-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Código: {trackingCode}</h2>
                  <p className="text-zinc-600">Status atual: <span className={isDelivered ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
                    {tracking[0].status}
                  </span></p>
                </div>
                <div className="text-5xl">
                  {isDelivered ? '✅' : '📦'}
                </div>
              </div>

              {/* Timeline de Rastreamento */}
              <div className="space-y-6">
                {tracking.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-indigo-500' : 'bg-zinc-200'
                      } text-white`}>
                        {step.icon}
                      </div>
                      {index < tracking.length - 1 && (
                        <div className="w-1 h-12 bg-zinc-200 my-2"></div>
                      )}
                    </div>
                    <div className="pb-6">
                      <h3 className="font-semibold text-lg text-zinc-900">{step.status}</h3>
                      <p className="text-zinc-600 text-sm mb-1">{step.description}</p>
                      <p className="text-zinc-500 text-xs">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              {isDelivered && (
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-semibold">🎉 Seu pedido foi entregue com sucesso!</p>
                  <p className="text-zinc-600 text-sm mt-2">Caso não tenha recebido, entre em contato conosco.</p>
                </div>
              )}
            </div>
          )}

          {showTracking && !tracking && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <p className="text-red-700 font-semibold">❌ Código não encontrado</p>
              <p className="text-zinc-600 text-sm mt-2">Verifique se o código está correto ou tente novamente mais tarde.</p>
            </div>
          )}
        </div>

        {/* Seção de Transportadoras */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Rastrear por Transportadora</h2>
          <p className="text-zinc-600 mb-8">
            Acesse o sistema de rastreamento das principais transportadoras:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {carriers.map((carrier) => (
              <Link
                key={carrier.id}
                href={carrier.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white border border-black/10 hover:border-indigo-500 p-6 rounded-xl transition hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition">{carrier.logo}</div>
                <h3 className="text-2xl font-bold mb-2">{carrier.name}</h3>
                <p className="text-zinc-600 text-sm mb-4">{carrier.description}</p>
                <div className="text-indigo-400 text-sm font-semibold group-hover:translate-x-1 transition">
                  Acessar →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Seção de Informações Úteis */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Informações Úteis</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-black/10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                Prazos de Entrega
              </h3>
              <ul className="space-y-3 text-zinc-600 text-sm">
                <li className="flex justify-between">
                  <span>São Paulo - SP</span>
                  <span className="text-indigo-400 font-semibold">2-3 dias úteis</span>
                </li>
                <li className="flex justify-between">
                  <span>RJ, ES, MG</span>
                  <span className="text-indigo-400 font-semibold">4-5 dias úteis</span>
                </li>
                <li className="flex justify-between">
                  <span>Outras regiões</span>
                  <span className="text-indigo-400 font-semibold">5-10 dias úteis</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-black/10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Como Rastrear
              </h3>
              <ol className="space-y-2 text-zinc-600 text-sm">
                <li>1. Procure o código de rastreamento no seu e-mail</li>
                <li>2. Cole o código no campo acima</li>
                <li>3. Clique em "Rastrear"</li>
                <li>4. Acompanhe em tempo real sua entrega</li>
              </ol>
            </div>

            <div className="bg-white p-6 rounded-xl border border-black/10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🚚</span>
                Status Possíveis
              </h3>
              <ul className="space-y-2 text-zinc-600 text-sm">
                <li>✓ <strong>Postado:</strong> Coleta realizada</li>
                <li>✓ <strong>Em trânsito:</strong> A caminho</li>
                <li>✓ <strong>Saiu para entrega:</strong> Hoje é o dia!</li>
                <li>✓ <strong>Entregue:</strong> Parabéns! Recebido</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-black/10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">❓</span>
                Problemas?
              </h3>
              <p className="text-zinc-600 text-sm mb-4">
                Se seu pedido não chegou ou você não encontra o código de rastreamento:
              </p>
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-500 font-semibold text-sm"
              >
                Acessar minha conta →
              </Link>
            </div>
          </div>
        </div>

        {/* Seção de FAQ */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Perguntas Frequentes</h2>

          <div className="space-y-4">
            <details className="bg-white p-6 rounded-xl border border-black/10 cursor-pointer group">
              <summary className="flex items-center justify-between font-semibold">
                <span>Quanto tempo leva para receber meu pedido?</span>
                <span className="group-open:rotate-180 transition text-indigo-400">▼</span>
              </summary>
              <p className="text-zinc-600 text-sm mt-4">
                O prazo depende da sua localidade. Geralmente levamos 2 a 10 dias úteis. 
                Você pode acompanhar o status em tempo real através do código de rastreamento.
              </p>
            </details>

            <details className="bg-white p-6 rounded-xl border border-black/10 cursor-pointer group">
              <summary className="flex items-center justify-between font-semibold">
                <span>Como encontro meu código de rastreamento?</span>
                <span className="group-open:rotate-180 transition text-indigo-400">▼</span>
              </summary>
              <p className="text-zinc-600 text-sm mt-4">
                O código é enviado para o seu e-mail cadastrado logo após a confirmação do pedido. 
                Procure por um e-mail com o assunto "Seu pedido foi enviado".
              </p>
            </details>

            <details className="bg-white p-6 rounded-xl border border-black/10 cursor-pointer group">
              <summary className="flex items-center justify-between font-semibold">
                <span>Meu pedido está parado. O que fazer?</span>
                <span className="group-open:rotate-180 transition text-indigo-400">▼</span>
              </summary>
              <p className="text-zinc-600 text-sm mt-4">
                Se seu pedido estiver parado por mais de 5 dias sem atualizações, entre em contato conosco 
                pelo e-mail suporte@imbalavel.com.br com seu código de rastreamento.
              </p>
            </details>

            <details className="bg-white p-6 rounded-xl border border-black/10 cursor-pointer group">
              <summary className="flex items-center justify-between font-semibold">
                <span>Posso mudar o endereço de entrega?</span>
                <span className="group-open:rotate-180 transition text-indigo-400">▼</span>
              </summary>
              <p className="text-zinc-600 text-sm mt-4">
                Isso depende do status do seu pedido. Se ainda não saiu do nosso centro de distribuição, 
                podemos fazer a alteração. Entre em contato rapidamente com nossa equipe.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}