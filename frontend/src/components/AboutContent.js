"use client";

import Image from 'next/image';
import Link from 'next/link';
import { FaCheese, FaLeaf, FaAward, FaTruck } from 'react-icons/fa';
import ProductionProcess from '@/components/ProductionProcess';

export default function AboutContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-left mb-12 pt-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Hakkımızda</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Doğal, lezzetli ve geleneksel yöntemlerle ürettiğimiz kaşar peynirlerimizle Türkiye'nin dört bir yanına hizmet veriyoruz.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hikayemiz</h2>
          <p className="text-gray-600 mb-4">
            Kaşarcım, 1985 yılında Kars'ın doğal coğrafyasında küçük bir aile işletmesi olarak kuruldu. Yıllar içinde geleneksel üretim yöntemlerini modern teknolojiyle birleştirerek, Türkiye'nin en kaliteli peynir üreticilerinden biri haline geldik.
          </p>
          <p className="text-gray-600 mb-4">
            Misyonumuz, doğal ve katkısız peynir ürünlerini, en yüksek kalite standartlarında tüketicilerimize ulaştırmaktır. Üretimden teslimata kadar her aşamada titizlikle çalışıyor, doğallıktan ve geleneksel lezzetten ödün vermiyoruz.
          </p>
          <p className="text-gray-600">
            Bugün, 200'den fazla çalışanımız ve modern tesislerimizle, Türkiye'nin dört bir yanındaki müşterilerimize hizmet veriyoruz. Geleneksel ve doğal peynir çeşitleriyle sofralarınıza lezzet ve sağlık katmaktan gurur duyuyoruz.
          </p>
        </div>
        <div className="relative aspect-video md:aspect-square">
          <Image 
            src={"https://cdn.kasarcim.com/f766d1f6fe551693_hakkimizda.png"}
            alt="Kaşarcım Peynir Üretim Tesisi" 
            fill 
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
      
      <div className="bg-orange-50 rounded-xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Değerlerimiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <FaCheese className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-2">Kalite</h3>
            <p className="text-gray-600 text-sm">En yüksek kalite standartlarında üretim yapıyoruz.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <FaLeaf className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-2">Doğallık</h3>
            <p className="text-gray-600 text-sm">Katkı maddesi içermeyen %100 doğal ürünler üretiyoruz.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <FaAward className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-2">Gelenek</h3>
            <p className="text-gray-600 text-sm">Geleneksel üretim yöntemlerimizi koruyoruz.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <FaTruck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-2">Güvenilirlik</h3>
            <p className="text-gray-600 text-sm">Müşteri memnuniyeti bizim için her şeyden önemlidir.</p>
          </div>
        </div>
      </div>
      
      <div className="mb-16">
        <ProductionProcess />
      </div>
      
      <div className="mt-16 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 md:p-10 text-center shadow-sm border border-amber-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bizimle İletişime Geçin</h2>
        <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
          Sorularınız, önerileriniz veya işbirliği talepleriniz için bizimle iletişime geçebilirsiniz.
        </p>
        <Link href="/iletisim" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold inline-block">
          İletişim Sayfası
        </Link>
      </div>
    </div>
  );
} 