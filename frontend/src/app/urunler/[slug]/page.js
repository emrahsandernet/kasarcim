// src/app/urunler/[slug]/page.js (veya page.tsx)
import ProductDetail from '@/components/ProductDetail';

export default async function ProductDetailPage({ params }) {
  // Next.js 15+ için params async olarak işlenmeli
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  return <ProductDetail slug={slug} />;
} 