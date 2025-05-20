 "use client";

import Link from 'next/link';
import { FaShippingFast, FaBox, FaTruck, FaMapMarkedAlt, FaRegClock, FaSnowflake, FaMoneyBillWave, FaSearchLocation } from 'react-icons/fa';

export default function KargoVeTeslimat() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Başlık */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 relative inline-block">
          Kargo ve Teslimat Bilgileri
          <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full transform translate-y-6"></span>
        </h1>
        <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
          Kaşarcım peynir alışveriş platformunda kargo ve teslimat süreçleri hakkında detaylı bilgilere buradan ulaşabilirsiniz. Eşsiz lezzetlerimizin size nasıl ulaştığını öğrenin.
        </p>
      </div>

      {/* Ana İçerik Bölümü */}
      <div className="space-y-12">
        {/* Teslimat Süreci */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-500 p-3 rounded-full text-white">
              <FaShippingFast className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Teslimat Süreci</h2>
              <p className="text-gray-600 mb-4">
                Siparişiniz onaylandıktan sonra, ürünleriniz özenle hazırlanır ve özel soğutuculu paketleme ile kargoya verilir. Siparişleriniz, ödemenizin onaylanmasından sonra genellikle 1-2 iş günü içinde hazırlanıp kargoya verilir.
              </p>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h3 className="font-medium text-gray-800 mb-2">Teslimat Aşamaları:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Sipariş onayı ve ödeme</li>
                  <li>Siparişin hazırlanması (8-24 saat)</li>
                  <li>Özel soğutmalı paketleme</li>
                  <li>Kargoya teslim</li>
                  <li>Teslimat (1-3 iş günü)</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Soğuk Zincir Teslimatı */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 p-3 rounded-full text-white">
              <FaSnowflake className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Soğuk Zincir Teslimatı</h2>
              <p className="text-gray-600 mb-4">
                Peynirlerimizin tazeliği ve lezzeti bizim için çok önemli. Bu nedenle tüm peynir ürünlerimizi özel soğutmalı paketleme sistemimizle hazırlayıp, soğuk zincir bozulmadan size ulaştırıyoruz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-gray-800 mb-2">Paketleme Teknolojimiz:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Termal yalıtımlı özel kutular</li>
                    <li>Profesyonel soğutucu jel paketleri</li>
                    <li>Nem kontrollü paketleme</li>
                    <li>Sıcaklık izleme etiketleri</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-gray-800 mb-2">Tazelik Garantisi:</h3>
                  <p className="text-gray-600">
                    Ürünlerimiz, özel yalıtımlı kutular ve buz paketleri ile paketlenerek 24 saate kadar ideal sıcaklıkta tazeliğini ve lezzetini korur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kargo Ücretleri */}
        <section className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-green-500 p-3 rounded-full text-white">
              <FaMoneyBillWave className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Kargo Ücretleri</h2>
              <p className="text-gray-600 mb-4">
                Müşteri memnuniyetini ön planda tutarak, tüm Türkiye'ye uygun kargo fiyatlarıyla hizmet veriyoruz.
              </p>
              <div className="bg-white overflow-hidden rounded-lg border border-green-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş Tutarı</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kargo Ücreti</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">0 TL - 1449.99 TL</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-600">250 TL</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">1500 TL ve üzeri</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">ÜCRETSİZ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <span className="font-medium">Not:</span> Uzak bölgeler veya adalar için ek kargo ücreti uygulanabilir. Detaylı bilgi için lütfen müşteri hizmetlerimizle iletişime geçin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

   
        {/* Kargo Takibi */}
        <section className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-500 p-3 rounded-full text-white">
              <FaSearchLocation className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Kargo Takibi</h2>
              <p className="text-gray-600 mb-4">
                Siparişiniz kargoya verildikten hemen sonra size SMS ve e-posta ile bilgilendirme yapılır ve kargo takip numarası paylaşılır.
              </p>
              <div className="bg-white p-5 rounded-lg border border-amber-200">
                <h3 className="font-medium text-gray-800 mb-3">Siparişinizi nasıl takip edebilirsiniz?</h3>
                <ol className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white text-xs mr-3 mt-0.5">1</span>
                    <p>Hesabınıza giriş yapın ve "Siparişlerim" sayfasına gidin.</p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white text-xs mr-3 mt-0.5">2</span>
                    <p>İlgili siparişin detaylarında "Kargo Takip" butonuna tıklayın.</p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white text-xs mr-3 mt-0.5">3</span>
                    <p>Size SMS veya e-posta ile gönderilen takip numarasını ilgili kargo firmasının web sitesinde sorgulayın.</p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Teslimat Sırasında */}
        <section className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-teal-500 p-3 rounded-full text-white">
              <FaBox className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Teslimat Sırasında</h2>
              <p className="text-gray-600 mb-4">
                Ürünlerinizin güvenli bir şekilde size ulaşması için dikkat edilmesi gereken hususlar:
              </p>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-teal-200">
                  <h3 className="font-medium text-gray-800 mb-2">Teslimat Kontrolü</h3>
                  <p className="text-gray-600">
                    Paketiniz teslim edildiğinde, dış ambalajın sağlam olup olmadığını kontrol edin. Herhangi bir hasar durumunda, kargo görevlisi yanındayken tutanak tutturun.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-teal-200">
                  <h3 className="font-medium text-gray-800 mb-2">Ürün Muhafazası</h3>
                  <p className="text-gray-600">
                    Paketinizi teslim aldıktan sonra, özellikle sıcak havalarda, peynir ürünlerini hızlıca buzdolabına kaldırmanızı öneririz. Peynirlerimizi, hava almayan bir kapta veya streç filmle sarılı şekilde buzdolabında (2-4°C) saklayınız.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* İletişim Çağrısı */}
      <div className="mt-12 text-center bg-orange-50 p-8 rounded-xl border border-orange-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Teslimat hakkında sorularınız mı var?</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Kargo ve teslimat süreçleri hakkında detaylı bilgi almak için müşteri hizmetlerimizle iletişime geçebilirsiniz. Size yardımcı olmaktan memnuniyet duyarız.
        </p>
        <div className="space-x-4">
          <Link href="/iletisim" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors">
            Bize Ulaşın
          </Link>
          <Link href="/sikca-sorulan-sorular" className="inline-flex items-center px-6 py-3 border border-gray-300 bg-white text-base font-medium rounded-md shadow-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Sıkça Sorulan Sorular
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        section {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}