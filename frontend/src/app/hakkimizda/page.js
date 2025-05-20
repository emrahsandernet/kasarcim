import AboutContent from '@/components/AboutContent';

export const metadata = {
  title: "Hakkımızda | Kaşarcım - Geleneksel Peynir Üreticisi",
  description: "Kaşarcım, 1985 yılından beri Türkiye'nin en kaliteli peynir üreticilerinden biri olarak hizmet vermektedir. Doğal ve geleneksel yöntemlerle ürettiğimiz peynirlerimiz hakkında bilgi edinin.",
  openGraph: {
    title: "Kaşarcım Hakkında - Geleneksel Peynir Üreticisi",
    description: "1985'ten beri doğal ve geleneksel yöntemlerle Türkiye'nin en kaliteli peynirlerini üretiyoruz. Kaşarcım hikayesi ve değerlerimiz hakkında bilgi edinin.",
    images: ['/images/about-us.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaşarcım'
  }
};

export default function AboutPage() {
  // Organization için Schema.org yapısal verisi
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kaşarcım",
    "url": "https://kasarcim.com",
    "logo": "https://kasarcim.com/images/logo.png",
    "foundingDate": "1985",
    "founders": [
      {
        "@type": "Person",
        "name": "Ali Yılmaz"
      }
    ],
    "description": "Kaşarcım, 1985 yılında Kars'ta kurulan, geleneksel yöntemlerle kaliteli peynir üreten bir aile şirketidir.",
    "numberOfEmployees": "200+",
    "slogan": "Doğal lezzet, geleneksel üretim",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kaşar Sokak No:123, Peynir Mahallesi",
      "addressLocality": "İstanbul",
      "postalCode": "34000",
      "addressCountry": "TR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+90-212-123-4567",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://www.facebook.com/kasarcim",
      "https://www.instagram.com/kasarcim",
      "https://twitter.com/kasarcim"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
        }}
      />
      <AboutContent />
    </>
  );
} 