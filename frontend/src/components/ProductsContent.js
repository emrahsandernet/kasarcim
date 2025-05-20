"use client";

import ProductsList from '@/components/ProductsList';
import { FaBoxOpen } from 'react-icons/fa';

export default function ProductsContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-left mb-12 pt-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Ürünlerimiz</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Doğal süt ve geleneksel yöntemlerle üretilen peynirlerimizin tadını çıkarın. 
          Tüm ürünlerimiz katkı maddesi içermez ve en yüksek kalite standartlarında üretilir.
        </p>
      </div>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 rounded-lg p-6 flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <FaBoxOpen className="text-orange-500 h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Doğal İçerik</h3>
            <p className="text-gray-600 text-sm mt-1">%100 doğal süt ve geleneksel yöntemler</p>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-6 flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <FaBoxOpen className="text-orange-500 h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Kalite Garantisi</h3>
            <p className="text-gray-600 text-sm mt-1">En yüksek kalite standartlarında üretim</p>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-6 flex items-center">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <FaBoxOpen className="text-orange-500 h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Taze Teslimat</h3>
            <p className="text-gray-600 text-sm mt-1">Soğuk zincir korunarak hızlı teslimat</p>
          </div>
        </div>
      </div>
      
      <ProductsList />
    </div>
  );
} 