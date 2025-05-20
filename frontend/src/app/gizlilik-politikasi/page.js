"use client";

import Link from 'next/link';
import { FaShieldAlt, FaUserShield, FaCookieBite, FaDatabase, FaHandshake, FaKey, FaEnvelope } from 'react-icons/fa';

export default function GizlilikPolitikasi() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Başlık */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 relative inline-block">
          Gizlilik Politikası
          <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full transform translate-y-6"></span>
        </h1>
        <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
          Kaşarcım olarak kişisel verilerinizin gizliliği ve güvenliği bizim için çok önemlidir. 
          Bu politika, verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında detaylı bilgi sağlar.
        </p>
      </div>

      {/* Son Güncelleme Bilgisi */}
      <div className="mb-10 text-center">
        <p className="text-sm text-gray-500">Son güncelleme: 1 Haziran 2023</p>
      </div>

      {/* Giriş Bölümü */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Giriş</h2>
        <div className="prose max-w-none text-gray-600">
          <p>
            Kaşarcım olarak, kullanıcılarımızın gizliliğine saygı duyuyor ve kişisel verilerinizin 
            korunmasına büyük önem veriyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde 
            ve hizmetlerimizi kullandığınızda verilerinizin nasıl toplandığını, kullanıldığını ve 
            korunduğunu açıklamaktadır.
          </p>
          <p className="mt-3">
            Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanmış olup, 
            veri sorumlusu sıfatıyla Kaşarcım tarafından uygulanmaktadır.
          </p>
        </div>
      </section>

      {/* Bölümler */}
      <div className="space-y-12">
        {/* Toplanan Bilgiler */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-500 p-3 rounded-full text-white">
              <FaDatabase className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Topladığımız Bilgiler</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Web sitemizi kullandığınızda veya hizmetlerimizi satın aldığınızda, aşağıdaki kişisel verileri toplayabiliriz:
                </p>
                <ul>
                  <li>
                    <strong>Kimlik Bilgileri:</strong> Ad, soyad, doğum tarihi gibi sizi tanımlayan bilgiler.
                  </li>
                  <li>
                    <strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, teslimat ve fatura adresi.
                  </li>
                  <li>
                    <strong>Ödeme Bilgileri:</strong> Kredi kartı bilgileri, banka hesap bilgileri veya diğer finansal bilgiler. 
                    Kredi kartı bilgileriniz tarafımızca saklanmamakta, ödeme altyapı sağlayıcılarımız tarafından güvenli şekilde işlenmektedir.
                  </li>
                  <li>
                    <strong>Sipariş Bilgileri:</strong> Satın aldığınız ürünler, sipariş tarihi, sipariş tutarı ve diğer işlem detayları.
                  </li>
                  <li>
                    <strong>Kullanım Bilgileri:</strong> Web sitemiz üzerindeki davranışlarınız, göz atma geçmişiniz, 
                    sitemizi nasıl kullandığınıza dair bilgiler, tıkladığınız ürünler ve sayfalar.
                  </li>
                  <li>
                    <strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, cihaz bilgisi, tahmini konum, siteye erişim zamanları.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Bilgileri Toplama Yöntemlerimiz */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 p-3 rounded-full text-white">
              <FaUserShield className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Bilgileri Toplama Yöntemlerimiz</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Bilgilerinizi çeşitli kanallar aracılığıyla toplamaktayız:
                </p>
                <ul>
                  <li>
                    <strong>Doğrudan Sağladığınız Bilgiler:</strong> Sitemize kayıt olduğunuzda, alışveriş yaptığınızda, 
                    müşteri hizmetlerimizle iletişime geçtiğinizde veya anketlerimize katıldığınızda bize verdiğiniz bilgiler.
                  </li>
                  <li>
                    <strong>Otomatik Toplanan Bilgiler:</strong> Web sitemizi ziyaret ettiğinizde çerezler ve diğer izleme teknolojileri 
                    aracılığıyla otomatik olarak toplanan bilgiler.
                  </li>
                  <li>
                    <strong>Üçüncü Taraf Kaynaklar:</strong> İş ortaklarımız, sosyal medya platformları veya kamuya açık 
                    kaynaklardan elde edebileceğimiz bilgiler.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Çerezler (Cookies) Politikası */}
        <section className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-green-500 p-3 rounded-full text-white">
              <FaCookieBite className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Çerezler (Cookies) Politikası</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Web sitemizde, deneyiminizi iyileştirmek için çerezler kullanıyoruz. Çerezler, tarayıcınız tarafından 
                  cihazınıza yerleştirilen küçük metin dosyalarıdır.
                </p>
                <p className="mt-3">
                  <strong>Kullandığımız çerez türleri:</strong>
                </p>
                <ul>
                  <li>
                    <strong>Zorunlu Çerezler:</strong> Sitemizin düzgün çalışması için gerekli olan çerezler.
                  </li>
                  <li>
                    <strong>Performans ve Analitik Çerezleri:</strong> Sitemizin nasıl kullanıldığı hakkında bilgi toplar ve 
                    performansını ölçmemize yardımcı olur.
                  </li>
                  <li>
                    <strong>İşlevsellik Çerezleri:</strong> Tercihlerinizi hatırlayarak size kişiselleştirilmiş bir deneyim sunar.
                  </li>
                  <li>
                    <strong>Hedefleme ve Reklam Çerezleri:</strong> İlgi alanlarınıza uygun reklamlar sunmak için kullanılır.
                  </li>
                </ul>
                <p className="mt-3">
                  Tarayıcı ayarlarınızı değiştirerek çerezleri reddedebilir veya çerez aldığınızda uyarı verecek şekilde 
                  ayarlayabilirsiniz. Ancak, bazı çerezleri devre dışı bırakmanız durumunda web sitemizin bazı özellikleri 
                  düzgün çalışmayabilir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Kişisel Verilerin Kullanım Amaçları */}
        <section className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-500 p-3 rounded-full text-white">
              <FaShieldAlt className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Kişisel Verilerin Kullanım Amaçları</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Topladığımız kişisel verileri aşağıdaki amaçlar için kullanırız:
                </p>
                <ul>
                  <li>
                    <strong>Hizmet Sağlamak:</strong> Siparişlerinizi işleme almak, ürünleri teslim etmek ve müşteri hizmetleri sunmak.
                  </li>
                  <li>
                    <strong>İletişim:</strong> Siparişleriniz, ürün teslimatları veya müşteri hizmetleri konularında sizinle iletişim kurmak.
                  </li>
                  <li>
                    <strong>Deneyimi Kişiselleştirme:</strong> Size özel teklifler ve öneriler sunmak, alışveriş deneyiminizi iyileştirmek.
                  </li>
                  <li>
                    <strong>Hizmetlerimizi İyileştirme:</strong> Web sitemizin işlevselliğini ve kullanıcı deneyimini geliştirmek.
                  </li>
                  <li>
                    <strong>Pazarlama:</strong> Size ilgi alanlarınıza uygun pazarlama iletişimleri göndermek (izin vermeniz halinde).
                  </li>
                  <li>
                    <strong>Yasal Yükümlülükler:</strong> Yasal yükümlülüklerimizi yerine getirmek ve haklarımızı korumak.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Kişisel Verilerin Paylaşımı */}
        <section className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-500 p-3 rounded-full text-white">
              <FaHandshake className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Kişisel Verilerin Paylaşımı</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmıyoruz:
                </p>
                <ul>
                  <li>
                    <strong>Hizmet Sağlayıcılar:</strong> Ödeme işleme, sipariş teslimatı, e-posta gönderimi, müşteri hizmetleri gibi 
                    hizmetlerimizi yerine getirmemize yardımcı olan güvenilir üçüncü taraf hizmet sağlayıcıları.
                  </li>
                  <li>
                    <strong>Yasal Zorunluluklar:</strong> Yasal bir yükümlülüğe uymak, haklarımızı korumak veya yasal bir sürece yanıt 
                    vermek için gerekli olduğunda.
                  </li>
                  <li>
                    <strong>İş Ortakları:</strong> Size daha iyi hizmet verebilmek için iş birliği yaptığımız güvenilir şirketler.
                  </li>
                  <li>
                    <strong>Açık Rızanız Olduğunda:</strong> Verilerinizi paylaşmamız için bize açık izin verdiğiniz durumlar.
                  </li>
                </ul>
                <p className="mt-3">
                  Üçüncü taraflarla paylaşılan kişisel verilerin gizliliğini korumak için gerekli tüm önlemleri alıyoruz ve bu üçüncü 
                  tarafların da en az bizim kadar sıkı veri koruma standartlarına uymalarını sağlıyoruz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Veri Güvenliği ve Saklama */}
        <section className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-teal-500 p-3 rounded-full text-white">
              <FaKey className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Veri Güvenliği ve Saklama</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz. Bu önlemler şunları içerir:
                </p>
                <ul>
                  <li>SSL şifreleme teknolojisi kullanarak veri iletimini koruma</li>
                  <li>Fiziksel, elektronik ve prosedürel korumalar uygulama</li>
                  <li>Verilerinize erişimi, sadece iş amaçlı erişim ihtiyacı olan çalışanlarımızla sınırlandırma</li>
                  <li>Düzenli güvenlik değerlendirmeleri ve testleri yapma</li>
                </ul>
                <p className="mt-3">
                  <strong>Veri Saklama Süresi:</strong> Kişisel verilerinizi, yasal yükümlülüklerimizi yerine getirmek, 
                  anlaşmazlıkları çözmek ve politikalarımızı uygulamak için gerekli olduğu sürece saklarız. Saklama süreleri, 
                  veri türüne ve kullanım amacına bağlı olarak değişir. Verilerinizin artık gerekli olmadığı durumlarda, 
                  güvenli bir şekilde imha edilir veya anonimleştirilir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Haklarınız */}
        <section className="bg-gradient-to-r from-rose-50 to-rose-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-rose-500 p-3 rounded-full text-white">
              <FaUserShield className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Haklarınız</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  6698 sayılı KVKK kapsamında, kişisel verileriniz ile ilgili aşağıdaki haklara sahipsiniz:
                </p>
                <ul>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Kişisel verileriniz işlenmiş ise buna ilişkin bilgi talep etme</li>
                  <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                  <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                  <li>KVKK ve ilgili diğer kanun hükümlerine uygun olarak işlenmiş olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan kalkması hâlinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                  <li>Düzeltme, silme veya yok etme işlemlerinin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                  <li>İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıktığını düşünüyorsanız buna itiraz etme</li>
                  <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                </ul>
                <p className="mt-3">
                  Bu haklarınızı kullanmak için, aşağıdaki İletişim bölümünde yer alan bilgiler üzerinden bizimle iletişime geçebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* İletişim */}
        <section className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-500 p-3 rounded-full text-white">
              <FaEnvelope className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">İletişim</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Bu Gizlilik Politikası hakkında sorularınız veya endişeleriniz varsa veya kişisel verilerinizle ilgili haklarınızı 
                  kullanmak istiyorsanız, lütfen aşağıdaki iletişim bilgilerini kullanarak bize ulaşın:
                </p>
                <div className="mt-3 bg-white p-4 rounded-lg border border-indigo-200">
                  <p><strong>Kaşarcım</strong></p>
                  <p>Adres: Güleser Sk. Hüseyin Apt. No:4 </p>
                  <p>Kat: 4, Çekmeköy / İstanbul, Türkiye</p>
                  <p>Web Sitesi: <Link href="https://www.kasarcim.com" className="text-indigo-500 hover:underline">www.kasarcim.com</Link></p>
                  <p>E-posta: info@kasarcim.com</p>
                  <p>Telefon: +90 552 396 31 41</p>
                </div>
                <p className="mt-3">
                  Tüm bilgi taleplerinize 30 gün içerisinde yanıt vermeye çalışacağız. Bazı durumlarda, kimliğinizi doğrulamamız 
                  gerekebilir ve ek bilgiler isteyebiliriz.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Değişiklikler */}
      <section className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Gizlilik Politikamızdaki Değişiklikler</h2>
        <p className="text-gray-600">
          Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Politikada önemli değişiklikler yapılması durumunda, 
          web sitemizde bir bildirim yayınlayarak veya size e-posta göndererek sizi bilgilendireceğiz. Bu politikanın 
          en son ne zaman güncellendiğini görmek için sayfanın üst kısmındaki "Son güncelleme" tarihine bakabilirsiniz.
        </p>
        <p className="mt-3 text-gray-600">
          Bu web sitesini kullanmaya devam etmeniz, güncellenmiş Gizlilik Politikasını kabul ettiğiniz anlamına gelir. 
          Politikamızı düzenli olarak gözden geçirmenizi öneririz.
        </p>
      </section>

      {/* Sayfa Altı Bağlantıları */}
      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-4">İlgili Politikalarımız</h3>
        <div className="space-x-4">
          <Link href="/kullanim-kosullari" className="text-orange-500 hover:underline">Kullanım Koşulları</Link>
          <Link href="/cerez-politikasi" className="text-orange-500 hover:underline">Çerez Politikası</Link>
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