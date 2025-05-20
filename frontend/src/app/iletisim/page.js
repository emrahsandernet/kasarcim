import ContactContent from '@/components/ContactContent';

export const metadata = {
  title: "İletişim | Kaşarcım - Bize Ulaşın",
  description: "Kaşarcım ile iletişime geçin. Sorularınız, önerileriniz veya siparişleriniz için bize telefon, e-posta veya iletişim formumuz aracılığıyla ulaşabilirsiniz.",
  openGraph: {
    title: "Kaşarcım İletişim - Bize Ulaşın",
    description: "Soru, öneri ve talepleriniz için bizimle iletişime geçebilirsiniz. Size yardımcı olmaktan memnuniyet duyarız.",
    images: ['/images/contact-us.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaşarcım'
  }
};

export default function ContactPage() {
  // LocalBusiness için Schema.org yapısal verisi
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Kaşarcım",
    "image": "https://kasarcim.com/images/logo.png",
    "url": "https://kasarcim.com",
    "telephone": "+90 552 396 31 41",
    "email": "info@kasarcim.com",
    "description": "Türkiye'nin en kaliteli peynir üreticisi ve tedarikçisi.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kaşar Sokak No:123, Peynir Mahallesi",
      "addressLocality": "İstanbul",
      "postalCode": "34000",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "41.0082",
      "longitude": "28.9784"
    },
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa 09:00-14:00"
    ],
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
      <ContactContent />
    </>
  );
} 