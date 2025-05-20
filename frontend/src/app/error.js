'use client';

import Link from 'next/link';
import { FaExclamationTriangle, FaRedo, FaArrowLeft } from 'react-icons/fa';

export default function Error({ error, reset }) {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="h-8 w-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Bir Hata Oluştu</h2>
          
          <p className="text-gray-600 mb-6">
            Üzgünüz, içeriği yüklerken bir sorun oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <FaRedo className="mr-2" />
              Tekrar Dene
            </button>
            
            <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              <FaArrowLeft className="mr-2" />
              Ana Sayfaya Dön
            </Link>
          </div>
          
          {error?.digest && (
            <p className="mt-8 text-xs text-gray-500">
              Hata Referans: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 