import "./globals.css";
import Header from "@/src/components/functions/page-inicio/Header";
import NewsletterPopup from "@/src/app/admin/componentes/NewsletterPopup";
import Script from 'next/script';
import type { Metadata } from "next";
import logoTexto from "@/src/public/assets/imagens/logo s texxto.png";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Imbalável | Perfumes e Cosméticos Premium",
    template: "%s | Imbalável",
  },
  description:
    "Curadoria premium de perfumes masculinos, cosméticos e fragrâncias marcantes. Ofertas exclusivas e seleção com alta performance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Imbalável | Perfumes e Cosméticos Premium",
    description:
      "Curadoria premium de perfumes masculinos, cosméticos e fragrâncias marcantes.",
    url: "/",
    siteName: "Imbalável",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imbalável | Perfumes e Cosméticos Premium",
    description:
      "Curadoria premium de perfumes masculinos, cosméticos e fragrâncias marcantes.",
  },
  icons: {
    icon: logoTexto.src,
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Imbalável",
        url: baseUrl,
        logo: `${baseUrl}${logoTexto.src}`,
      },
      {
        "@type": "WebSite",
        name: "Imbalável",
        url: baseUrl,
      },
    ],
  };

  return (
    <html lang="pt-BR">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {PIXEL_ID && (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
            </Script>
            <noscript
              dangerouslySetInnerHTML={{ __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" />` }}
            />
          </>
        )}

        <NewsletterPopup />
        <Header />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
