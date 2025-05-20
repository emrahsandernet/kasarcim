"use client";

import Hero from '@/components/Hero';
import WhyChooseUs from '@/components/WhyChooseUs';
import FeaturedProducts from '@/components/FeaturedProducts';
import { FaTruck, FaCreditCard, FaUndo, FaHeadset } from 'react-icons/fa';

export default function HomeContent() {
  return (
    <div className="bg-gray-50">
      {/* Hero bölümü */}
      <div className="bg-white">
      <Hero />
      </div>
      
      {/* Neden Bizi Seçmelisiniz */}
      <div className="pt-16 pb-12">
      <WhyChooseUs />
      </div>
      
      {/* Öne Çıkan Ürünlerimiz */}
      <div className="py-16 bg-white">
      <FeaturedProducts />
      </div>
      
      {/* Servis Özellikleri */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-12 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hizmetlerimiz</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Siparişinizden teslimatına kadar her aşamada sizin memnuniyetiniz için çalışıyoruz
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg hover:-translate-y-1 text-center flex flex-col items-center">
              <div className="bg-orange-100 p-5 rounded-full w-20 h-20 flex items-center justify-center mb-5">
                <FaTruck className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Ücretsiz Kargo</h3>
                <p className="text-gray-600">1500₺ üzeri siparişlerde ücretsiz kargo</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg hover:-translate-y-1 text-center flex flex-col items-center">
              <div className="bg-orange-100 p-5 rounded-full w-20 h-20 flex items-center justify-center mb-5">
                <FaCreditCard className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">Güvenli Ödeme</h3>
                <p className="text-gray-600">SSL güvenlik sertifikası ile güvenli ödeme</p>
              </div>
            </div>

            
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg hover:-translate-y-1 text-center flex flex-col items-center">
              <div className="bg-orange-100 p-5 rounded-full w-20 h-20 flex items-center justify-center mb-5">
                <FaHeadset className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">7/24 Destek</h3>
                <p className="text-gray-600">Her zaman yanınızdayız</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 