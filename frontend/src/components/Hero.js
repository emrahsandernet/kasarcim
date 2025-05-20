"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-700">
              Türkiye'nin En Lezzetli<br />
              Kaşar Peyniri
            </h1>
            <p className="text-lg mb-8 text-slate-600">
              Doğal yöntemlerle üretilen, geleneksel lezzeti modern kalite
              standartlarıyla buluşturan kaşar peynirlerimizi keşfedin.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link 
                href="/urunler" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Ürünlerimiz
              </Link>
              <Link 
                href="/hakkimizda" 
                className="bg-white border border-gray-300 hover:bg-gray-100 text-slate-700 px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Hakkımızda
              </Link>
            </div>
          </div>
          
          <div className="relative rounded-lg overflow-hidden h-[400px]">
        
            <Image
              src="https://cdn.kasarcim.com/0547d9a983b84b76_kasar-hero.png"
              alt="Kaşar Peyniri"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              className="w-full h-full bg-orange-50 rounded-lg flex items-center justify-center"
              priority
            />
           
          </div>
        </div>
      </div>
    </section>
  );
} 