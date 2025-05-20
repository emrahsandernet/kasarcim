"use client";

import Link from 'next/link';
import { FaCookieBite, FaInfoCircle, FaCheckCircle, FaTools, FaChartBar, FaAd, FaShieldAlt, FaExclamationTriangle, FaQuestionCircle } from 'react-icons/fa';

export default function CerezPolitikasi() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Başlık */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 relative inline-block">
          Çerez Politikası
          <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full transform translate-y-6"></span>
        </h1>
        <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
          Kaşarcım olarak, web sitemizde çerezler ve benzer teknolojiler kullanırken deneyiminizi ve gizliliğinizi önemsiyoruz. 
          Bu politika, hangi çerezleri kullandığımızı ve nasıl kontrol edebileceğinizi açıklar.
        </p>
      </div>

      {/* Son Güncelleme Bilgisi */}
      <div className="mb-10 text-center">
        <p className="text-sm text-gray-500">Son güncelleme: 1 Haziran 2023</p>
      </div>

      {/* Giriş Bölümü */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Çerezler Hakkında</h2>
        <div className="prose max-w-none text-gray-600">
          <p>
            Çerezler, web sitelerini ziyaret ettiğinizde bilgisayarınıza, akıllı telefonunuza veya diğer 
            cihazlarınıza yerleştirilen küçük metin dosyalarıdır. Bu dosyalar, web sitemizin sizi tanımasını, 
            tercihlerinizi hatırlamasını ve size daha iyi bir deneyim sunmasını sağlar.
          </p>
          <p className="mt-3">
            Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili diğer mevzuat 
            kapsamında hazırlanmış olup, Kaşarcım web sitesinde kullanılan çerezleri ve bu çerezlerin 
            kullanım amaçlarını açıklamaktadır.
          </p>
        </div>
      </section>

      {/* Bölümler */}
      <div className="space-y-12">
        {/* Çerez Türleri */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-500 p-3 rounded-full text-white">
              <FaCookieBite className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Kullandığımız Çerez Türleri</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Kaşarcım'da çeşitli çerez türleri kullanılmaktadır:
                </p>
                <ul>
                  <li>
                    <strong>Zorunlu Çerezler:</strong> Web sitemizin temel işlevlerini gerçekleştirmek için gerekli olan çerezlerdir. 
                    Bu çerezler olmadan web sitemiz düzgün çalışmaz.
                  </li>
                  <li>
                    <strong>Tercih Çerezleri:</strong> Bu çerezler, tercihlerinizi hatırlamamıza sağlar, böylece 
                    web sitemizi her ziyaretinizde ayarlarınızı yeniden yapmanıza gerek kalmaz.
                  </li>
                  <li>
                    <strong>Analiz/Performans Çerezleri:</strong> Bu çerezler, web sitemizin nasıl kullanıldığına dair 
                    bilgi toplar. Bu, web sitemizin performansını ölçmemize ve iyileştirmemize yardımcı olur.
                  </li>
                  <li>
                    <strong>Pazarlama/Hedefleme Çerezleri:</strong> Bu çerezler, sizi ilgilendirebilecek içerikler 
                    ve reklamlar sunmak için kullanılır. İlgi alanlarınıza göre kişiselleştirilmiş içerik 
                    görmenize yardımcı olurlar.
                  </li>
                </ul>
                <p className="mt-3">
                  Bazı çerezler doğrudan tarafımızca yerleştirilirken (birinci taraf çerezleri), bazıları 
                  ise iş ortaklarımız veya hizmet sağlayıcılarımız tarafından yerleştirilir (üçüncü taraf çerezleri).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Zorunlu Çerezler */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 p-3 rounded-full text-white">
              <FaCheckCircle className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Zorunlu Çerezler</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Bu çerezler, web sitemizin düzgün çalışması için gerekli olan temel çerezlerdir. 
                  Bunlar olmadan, sitede gezinme ve temel özellikleri kullanma gibi hizmetler sağlanamaz.
                </p>
                <div className="bg-white p-4 mt-3 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-gray-800 mb-2">Kullanılan Zorunlu Çerezler:</h3>
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left font-medium text-gray-700">Çerez Adı</th>
                        <th className="text-left font-medium text-gray-700">Amacı</th>
                        <th className="text-left font-medium text-gray-700">Süresi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-2">session_id</td>
                        <td className="py-2">Kullanıcı oturumunu tanımlamak için</td>
                        <td className="py-2">Oturum süresi</td>
                      </tr>
                      <tr>
                        <td className="py-2">auth_token</td>
                        <td className="py-2">Kullanıcı kimlik doğrulama bilgilerini saklamak için</td>
                        <td className="py-2">30 gün</td>
                      </tr>
                      <tr>
                        <td className="py-2">csrf_token</td>
                        <td className="py-2">Cross-site request forgery saldırılarını önlemek için</td>
                        <td className="py-2">Oturum süresi</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">
                  Zorunlu çerezleri devre dışı bırakmak, web sitemizin düzgün çalışmasını engelleyebilir. 
                  Bu çerezler kişisel bilgilerinizi toplamaz ve tarayıcınızı kapattığınızda otomatik olarak silinir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tercih Çerezleri */}
        <section className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-green-500 p-3 rounded-full text-white">
              <FaTools className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Tercih Çerezleri</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Tercih çerezleri, web sitemizi kullanırken seçimlerinizi hatırlamamıza ve size 
                  daha kişiselleştirilmiş bir deneyim sunmamıza olanak tanır.
                </p>
                <div className="bg-white p-4 mt-3 rounded-lg border border-green-200">
                  <h3 className="font-medium text-gray-800 mb-2">Kullanılan Tercih Çerezleri:</h3>
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left font-medium text-gray-700">Çerez Adı</th>
                        <th className="text-left font-medium text-gray-700">Amacı</th>
                        <th className="text-left font-medium text-gray-700">Süresi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-2">language</td>
                        <td className="py-2">Tercih ettiğiniz dil ayarını saklamak için</td>
                        <td className="py-2">1 yıl</td>
                      </tr>
                      <tr>
                        <td className="py-2">theme</td>
                        <td className="py-2">Site tema tercihlerinizi hatırlamak için</td>
                        <td className="py-2">1 yıl</td>
                      </tr>
                      <tr>
                        <td className="py-2">recently_viewed</td>
                        <td className="py-2">Son görüntülenen ürünlerinizi kaydetmek için</td>
                        <td className="py-2">30 gün</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">
                  Bu çerezleri devre dışı bırakabilirsiniz, ancak bu durumda bazı tercihlerinizin kaydedilmemesi 
                  ve size kişiselleştirilmiş bir deneyim sunulamaması gibi sonuçlar doğabilir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Analiz/Performans Çerezleri */}
        <section className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-500 p-3 rounded-full text-white">
              <FaChartBar className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Analiz ve Performans Çerezleri</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Bu çerezler, web sitemizi nasıl kullandığınız hakkında bilgi toplar. Bu bilgiler, 
                  sitemizin performansını analiz etmemize ve iyileştirmemize yardımcı olur.
                </p>
                <div className="bg-white p-4 mt-3 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-gray-800 mb-2">Kullanılan Analiz Çerezleri:</h3>
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left font-medium text-gray-700">Çerez Adı</th>
                        <th className="text-left font-medium text-gray-700">Amacı</th>
                        <th className="text-left font-medium text-gray-700">Süresi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-2">_ga</td>
                        <td className="py-2">Google Analytics tarafından kullanılır. Ziyaretçileri ayırt etmek için kullanılır.</td>
                        <td className="py-2">2 yıl</td>
                      </tr>
                      <tr>
                        <td className="py-2">_gid</td>
                        <td className="py-2">Google Analytics tarafından kullanılır. Ziyaretçileri ayırt etmek için kullanılır.</td>
                        <td className="py-2">24 saat</td>
                      </tr>
                      <tr>
                        <td className="py-2">_gat</td>
                        <td className="py-2">Google Analytics tarafından kullanılır. İstek oranını düşürmek için kullanılır.</td>
                        <td className="py-2">1 dakika</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">
                  Bu çerezler topladığı veriler aracılığıyla, hangi sayfaların en çok ziyaret edildiği, 
                  kullanıcıların sitede ne kadar süre kaldığı, hangi hata mesajlarının alındığı gibi 
                  bilgileri anlamamıza yardımcı olur. Veriler anonim olarak toplanır ve sizi kişisel 
                  olarak tanımlamak için kullanılmaz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pazarlama/Hedefleme Çerezleri */}
        <section className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-500 p-3 rounded-full text-white">
              <FaAd className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Pazarlama ve Hedefleme Çerezleri</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Bu çerezler, sizin için daha alakalı reklamlar sunmak ve pazarlama kampanyalarımızın 
                  etkinliğini ölçmek için kullanılır.
                </p>
                <div className="bg-white p-4 mt-3 rounded-lg border border-amber-200">
                  <h3 className="font-medium text-gray-800 mb-2">Kullanılan Pazarlama Çerezleri:</h3>
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left font-medium text-gray-700">Çerez Adı</th>
                        <th className="text-left font-medium text-gray-700">Amacı</th>
                        <th className="text-left font-medium text-gray-700">Süresi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-2">_fbp</td>
                        <td className="py-2">Facebook tarafından kullanılır. Reklamların etkinliğini takip etmek için kullanılır.</td>
                        <td className="py-2">3 ay</td>
                      </tr>
                      <tr>
                        <td className="py-2">ads/ga-audiences</td>
                        <td className="py-2">Google AdWords tarafından kullanılır. Dönüşüm olasılığı yüksek olan kullanıcıları yeniden hedeflemek için kullanılır.</td>
                        <td className="py-2">Oturum süresi</td>
                      </tr>
                      <tr>
                        <td className="py-2">IDE</td>
                        <td className="py-2">DoubleClick tarafından kullanılır. Reklam performansını ölçmek ve kullanıcılara daha alakalı reklamlar sunmak için kullanılır.</td>
                        <td className="py-2">1 yıl</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">
                  Bu çerezler, göz atma davranışınızı takip ederek ilgi alanlarınıza göre size 
                  özelleştirilmiş reklamlar gösterilmesini sağlar. Ayrıca, reklamları görüntüleme 
                  sayısını sınırlandırmaya ve reklamların etkinliğini ölçmeye yardımcı olur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Çerezleri Nasıl Kontrol Edebilirsiniz */}
        <section className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-teal-500 p-3 rounded-full text-white">
              <FaShieldAlt className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Çerezleri kabul etmek zorunda değilsiniz. Çoğu web tarayıcısı otomatik olarak çerezleri kabul edecek 
                  şekilde ayarlanmıştır, ancak tarayıcınızın ayarlarını değiştirerek çerezleri reddedebilir veya belirli 
                  çerezleri engelleyebilirsiniz. Tarayıcı ayarlarınızı nasıl değiştireceğiniz hakkında bilgi almak için 
                  lütfen tarayıcınızın yardım sayfasına başvurun.
                </p>
                <p className="mt-3">
                  <strong>Popüler tarayıcılar için çerez ayarları:</strong>
                </p>
                <ul>
                  <li>
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                      Google Chrome
                    </a>
                  </li>
                  <li>
                    <a href="https://support.mozilla.org/tr/kb/cerezleri-silme-web-sitelerinin-bilgilerini-kaldirma" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                      Mozilla Firefox
                    </a>
                  </li>
                  <li>
                    <a href="https://support.microsoft.com/tr-tr/help/4027947/microsoft-edge-delete-cookies" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                      Microsoft Edge
                    </a>
                  </li>
                  <li>
                    <a href="https://support.apple.com/tr-tr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                      Safari
                    </a>
                  </li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Lütfen Dikkat:</strong> Çerezleri devre dışı bırakmak veya engellemek, web sitemizin 
                        bazı özelliklerinin düzgün çalışmamasına neden olabilir. Bu durumda, web sitemizde sunduğumuz 
                        bazı hizmetlere erişemeyebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Üçüncü Taraf Çerezleri */}
        <section className="bg-gradient-to-r from-rose-50 to-rose-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-rose-500 p-3 rounded-full text-white">
              <FaQuestionCircle className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Üçüncü Taraf Çerezleri</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Web sitemizde, üçüncü taraf hizmet sağlayıcılar tarafından yerleştirilen çerezler de bulunmaktadır. 
                  Bunlar, site kullanımınızı analiz etme, reklam performansını ölçme veya sosyal medya özellikleri 
                  sağlama gibi amaçlar için kullanılabilir.
                </p>
                <p className="mt-3">
                  <strong>Web sitemizde kullanılan üçüncü taraf çerezleri şunlardır:</strong>
                </p>
                <ul>
                  <li>
                    <strong>Google Analytics:</strong> Web sitesi trafiğini analiz etmek için kullanılır.
                  </li>
                  <li>
                    <strong>Facebook Pixel:</strong> Reklam kampanyalarının etkinliğini ölçmek için kullanılır.
                  </li>
                  <li>
                    <strong>Google AdWords:</strong> Dönüşümleri takip etmek ve daha alakalı reklamlar sunmak için kullanılır.
                  </li>
                  <li>
                    <strong>Hotjar:</strong> Kullanıcı davranışlarını ve kullanıcı deneyimini iyileştirmek için kullanılır.
                  </li>
                </ul>
                <p className="mt-3">
                  Bu üçüncü taraf hizmet sağlayıcılar, kendi gizlilik politikalarına sahiptir ve kendi çerezlerini nasıl 
                  kullandıklarına dair bilgi için doğrudan onlara başvurmanızı öneririz.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Değişiklikler */}
      <section className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Çerez Politikamızdaki Değişiklikler</h2>
        <p className="text-gray-600">
          Kaşarcım, bu Çerez Politikasını zaman zaman güncelleyebilir. Politikada önemli değişiklikler 
          yapıldığında, web sitemizde bir bildirim yayınlayarak veya size e-posta göndererek sizi 
          bilgilendireceğiz. Bu politikanın en son ne zaman güncellendiğini görmek için sayfanın üst 
          kısmındaki "Son güncelleme" tarihine bakabilirsiniz.
        </p>
        <p className="mt-3 text-gray-600">
          Web sitemizi kullanmaya devam etmeniz, güncellenmiş Çerez Politikasını kabul ettiğiniz anlamına gelir. 
          Bu politikayı düzenli olarak gözden geçirmenizi öneririz.
        </p>
      </section>

      {/* İletişim */}
      <section className="mt-8 text-center">
        <p className="text-gray-600">
          Bu Çerez Politikası veya çerezlerin kullanımı hakkında sorularınız varsa, 
          lütfen bizimle iletişime geçin:
        </p>
        <p className="mt-2 font-medium">
          <a href="mailto:info@kasarcim.com" className="text-orange-500 hover:underline">info@kasarcim.com</a> | 
          <a href="tel:+902121234567" className="text-orange-500 hover:underline ml-2">+90 552 396 31 41</a>
        </p>
      </section>

      {/* Sayfa Altı Bağlantıları */}
      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-4">İlgili Politikalarımız</h3>
        <div className="space-x-4">
          <Link href="/gizlilik-politikasi" className="text-orange-500 hover:underline">Gizlilik Politikası</Link>
          <Link href="/kullanim-kosullari" className="text-orange-500 hover:underline">Kullanım Koşulları</Link>
          <Link href="/iletisim" className="text-orange-500 hover:underline">İletişim</Link>
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