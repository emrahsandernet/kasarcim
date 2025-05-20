"use client";

import { FaLeaf, FaMedal, FaTruck } from 'react-icons/fa';

// Neden Kaşarcım kartları
const benefits = [
  {
    id: 1,
    title: '%100 Doğal',
    description: 'Tamamen doğal süt ve geleneksel yöntemlerle üretilen kaşar peynirlerimiz katkı maddesi içermez.',
    icon: FaLeaf,
  },
  {
    id: 2,
    title: 'Ödüllü Lezzet',
    description: 'Ulusal ve uluslararası yarışmalarda ödül kazanmış eşsiz lezzetimizle fark yaratıyoruz.',
    icon: FaMedal,
  },
  {
    id: 3,
    title: 'Hızlı Teslimat',
    description: 'Türkiye\'nin her yerine soğuk zincir korunarak hızlı teslimat sağlıyoruz.',
    icon: FaTruck,
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Neden Kaşarcım?</h2>
          <div className="mt-2 h-1 w-24 bg-orange-500 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div 
              key={benefit.id} 
              className="bg-gray-50 rounded-lg p-6 flex flex-col items-center text-center"
            >
              <div className="bg-orange-500 w-20 h-20 rounded-full flex items-center justify-center text-white mb-5">
                <benefit.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 max-w-xs mx-auto">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 