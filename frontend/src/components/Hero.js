"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative bg-orange-900 min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Arka plan görseli */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://cdn.kasarcim.com/0547d9a983b84b76_kasar-hero.png"
          alt="Kaşar Peyniri Dükkanı"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          className="opacity-60"
          priority
        />
        {/* Turuncu gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-800/70 to-gray-700/70"></div>
      </div>
      
      {/* İçerik */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
        Doğanın Lezzeti, Köylünün Emeği
      </h1>
      <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-white font-medium">
        Organik yöntemlerle üretilen köy peynirleri, el emeğiyle sofranıza ulaşıyor.
      </p>
        <Link 
          href="/urunler" 
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 md:px-12 md:py-5 text-lg md:text-xl font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25 border-2 border-orange-400"
        >
          ALIŞVERİŞE BAŞLA
        </Link>
      </div>
    </section>
  );
} 