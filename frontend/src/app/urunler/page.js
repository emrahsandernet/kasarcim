import ProductsContent from '@/components/ProductsContent';

export const metadata = {
  title: "Peynir Ürünlerimiz | Kaşarcım - Kaliteli Kaşar Peyniri",
  description: "Doğal süt ve geleneksel yöntemlerle üretilen peynirlerimizin tadını çıkarın. Tüm ürünlerimiz katkı maddesi içermez ve en yüksek kalite standartlarında üretilir.",
  openGraph: {
    title: "Peynir Ürünlerimiz | Kaşarcım",
    description: "Doğal süt ve geleneksel yöntemlerle üretilen peynirlerimizin tadını çıkarın.",
    type: 'website'
  }
};

export default function ProductsPage() {
  return <ProductsContent />;
} 