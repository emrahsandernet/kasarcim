import HomeContent from '@/components/HomeContent';

export const metadata = {
  title: "Kaşarcım - Türkiye'nin En Lezzetli Kaşar Peyniri ve Süt Ürünleri",
  description: "Türkiye'nin en kaliteli süt ürünleri ve peynir çeşitlerini keşfedin. Doğal süt ve geleneksel yöntemlerle ürettiğimiz kaşar peynirlerimizle lezzeti sofranıza getiriyoruz.",
  openGraph: {
    title: "Kaşarcım - Türkiye'nin En Lezzetli Kaşar Peyniri",
    description: "Doğal süt ve geleneksel yöntemlerle üretilen eşsiz tadıyla peynir çeşitleri. Sizin için özenle hazırlanıp gönderiliyor.",
    images: ['/images/kasarcim-logo-icon.svg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaşarcım'
  }
};

export default function Home() {
  return <HomeContent />;
}
