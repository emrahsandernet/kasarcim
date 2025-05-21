import HomeContent from '@/components/HomeContent';

export const metadata = {
  title: "Kaşarcım - Türkiye'nin En Lezzetli ve Organik Kaşar Peyniri",
  description: "Türkiye'nin en kaliteli süt ürünleri ve peynir çeşitlerini keşfedin. Doğal süt ve geleneksel yöntemlerle ürettiğimiz kaşar peynirlerimizle lezzeti sofranıza getiriyoruz.",
  openGraph: {
    title: "KKaşarcım - Türkiye'nin En Lezzetli ve Organik Kaşar Peyniri",
    description: "Doğal süt ve geleneksel yöntemlerle üretilen eşsiz tadıyla peynir çeşitleri. Sizin için özenle hazırlanıp gönderiliyor.",
    images: ['https://cdn.kasarcim.com/727b287e1370e7bc_logo.png'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kaşarcım'
  }
};

export default function Home() {
  return <HomeContent />;
}
