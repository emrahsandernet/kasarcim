"use client";

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import CustomLink from './CustomLink';
import { FaArrowRight } from 'react-icons/fa';
import { ProductService } from '@/services';
import PageLoader from './PageLoader';

// Örnek açıklamalar - API'den gelen verilerde açıklama yoksa kullanılacak
const sampleDescriptions = [
  "Doğal yöntemlerle üretilen taze peynir",
  "Geleneksel tariflerle hazırlanan lezzetli peynir",
  "Özel olarak seçilmiş sütlerden üretilen peynir çeşidi",
  "Kahvaltıların vazgeçilmezi, ekşimsi aromalı peynir",
  "Özel fermantasyon sürecinden geçirilen enfes lezzet",
  "Tam olgunlaşmış, zengin aromalı peynir"
];

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchProducts = async () => {
      try {
        // ProductService ile ürünleri getir
        const data = await ProductService.getProducts();
        
        // API'den gelen verilerde eksik bilgiler varsa tamamlayalım
        const enhancedProducts = data.slice(0, 8).map(product => {
          const enhancedProduct = { ...product };
          
          // Ağırlık bilgisi kontrolü
          if (!product.weight || product.weight === 0) {
            enhancedProduct.weight = Math.floor(Math.random() * (2000 - 250 + 1)) + 250;
          }
          
          // Açıklama bilgisi kontrolü
          if (!product.description || product.description.trim() === '') {
            const randomIndex = Math.floor(Math.random() * sampleDescriptions.length);
            enhancedProduct.description = sampleDescriptions[randomIndex];
          }
          
          return enhancedProduct;
        });
        
        setProducts(enhancedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Ürünler yüklenirken hata oluştu:', error);
        setError('Ürünler yüklenemedi. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Skeleton bileşeni
  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-pulse">
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gray-200 rounded"></div>
        <div className="absolute bottom-2 left-2 bg-gray-200 h-6 w-20 rounded-md"></div>
      </div>
      <div className="p-4">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex justify-between items-end mt-4">
          <div>
            <div className="h-7 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">Hata Oluştu</h2>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Öne Çıkan Ürünler</h2>
          <CustomLink href="/urunler" className="text-orange-500 hover:text-orange-600 font-semibold inline-flex items-center">
            Tümünü Gör
            <FaArrowRight className="ml-2" />
          </CustomLink>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            // Yükleme durumunda iskelet göster
            [...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : (
            // Ürünleri göster
            products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  category_name: product.category_name || '',
                  category_slug: product.category?.slug || '',
                  image: product.image || '/images/placeholder.png',
                  slug: product.slug || `product-${product.id}`,
                  weight: product.weight || 0,
                  description: product.description || ''
                }} 
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
} 