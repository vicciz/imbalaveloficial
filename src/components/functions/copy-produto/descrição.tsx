"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { supabase } from '@/supabaseClient';

interface DescricaoProps {
  detalhesRender: string;
}

export default function Descricao({ detalhesRender }: DescricaoProps) {
  return (
    <section className="py-14 animate-fadeUp">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-center">Descrição do Produto</h2>
        <div className="mt-8 bg-white rounded-2xl p-8 border border-[#dbe6f7] shadow-lg">
          <div className="text-[#56719a] text-lg leading-relaxed space-y-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: ({ src = '', alt = '', style, ...props }) => {
                  if (!src || typeof src !== 'string') return null;
                  const resolved = src.startsWith('http') ? src : supabase!.storage.from('produto').getPublicUrl(src).data.publicUrl;
                  const mergedStyle: React.CSSProperties = {
                    display: 'block',
                    width: '100%',
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '60vh',
                    margin: '0 auto',
                    objectFit: 'contain',
                    ...(style as React.CSSProperties || {}),
                  };

                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...props}
                      src={resolved}
                      alt={alt}
                      style={mergedStyle}
                      className="rounded-xl border border-[#dbe6f7] shadow-sm my-4"
                    />
                  );
                },
                a: ({ href = '', children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2f61b9] underline break-all"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {detalhesRender}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}