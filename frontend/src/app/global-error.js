'use client';

import Link from 'next/link';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-20">
          <div className="text-center max-w-xl mx-auto">
            <div className="text-7xl text-red-500 mb-8">
              <FaExclamationTriangle className="inline-block" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Bir Hata Oluştu</h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Üzgünüz, bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin veya ana sayfaya dönün.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={() => reset()}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium"
              >
                Tekrar Dene
              </button>
              
              <Link href="/" className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-md font-medium flex items-center justify-center">
                <FaHome className="mr-2" />
                Ana Sayfa
              </Link>
            </div>
            
            <div className="text-sm text-gray-500 mt-8">
              <p>Hata kodu: {error?.digest ?? 'Unknown'}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 