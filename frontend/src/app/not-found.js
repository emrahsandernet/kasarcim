'use client';

import Link from 'next/link';
import { FaHome, FaBoxOpen, FaSearchLocation, FaQuestionCircle } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-20">
      <div className="text-center max-w-xl mx-auto">
        <div className="mb-8">
          <div className="text-orange-500 text-9xl font-bold mb-4">404</div>
          <div className="w-24 h-24 mx-auto">
            <FaQuestionCircle className="w-full h-full text-orange-400" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sayfa Bulunamadı</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          Lezzetli peynirlerimize göz atmak ister misiniz?
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center">
            <FaHome className="mr-2" />
            Ana Sayfa
          </Link>
          
          <Link href="/urunler" className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-md font-medium flex items-center justify-center">
            <FaBoxOpen className="mr-2" />
            Ürünlere Göz At
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Bir sorun olduğunu düşünüyorsanız, lütfen bizimle <Link href="/iletisim" className="text-orange-500 hover:text-orange-600">iletişime geçin</Link>.</p>
        </div>
      </div>
    </div>
  );
} 