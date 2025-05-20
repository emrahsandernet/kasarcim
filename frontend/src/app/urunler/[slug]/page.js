// src/app/urunler/[slug]/page.js (veya page.tsx)
import { Suspense } from 'react';
import ProductDetail from '@/components/ProductDetail';
import Loader from '@/components/Loader';

export default async function ProductDetailPage({ params }) {
  // Next.js 15+ için params async olarak işlenmeli
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
    return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
          <Loader size="large" />
        </div>
      }
    >
      <ProductDetail slug={slug} />
      </Suspense>
  );
} 