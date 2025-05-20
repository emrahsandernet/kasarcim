"use client";

import Link from 'next/link';
import { FaFileContract, FaUserCircle, FaBalanceScale, FaShoppingCart, FaCreditCard, FaExchangeAlt, FaCopyright, FaGavel, FaInfoCircle } from 'react-icons/fa';

export default function KullanimKosullari() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Başlık */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 relative inline-block">
          Kullanım Koşulları
          <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full transform translate-y-6"></span>
        </h1>
        <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
          Kaşarcım platformunu kullanmadan önce lütfen aşağıdaki kullanım koşullarını dikkatle okuyunuz.
          Sitemizi kullanarak bu koşulları kabul etmiş sayılırsınız.
        </p>
      </div>

      {/* Son Güncelleme Bilgisi */}
      <div className="mb-10 text-center">
        <p className="text-sm text-gray-500">Son güncelleme: 1 Haziran 2023</p>
      </div>

      {/* Giriş Bölümü */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Giriş ve Kabul</h2>
        <div className="prose max-w-none text-gray-600">
          <p>
            Bu Kullanım Koşulları, www.kasarcim.com adresindeki web sitesi ve ilgili tüm alt alan adlarını ("Site") 
            ve Kaşarcım tarafından sunulan hizmetleri kullanımınızı düzenlemektedir. Site'yi kullanarak veya 
            hizmetlerimize erişerek, bu Kullanım Koşulları'nı okuduğunuzu, anladığınızı ve bunlara uymayı kabul 
            ettiğinizi beyan edersiniz.
          </p>
          <p className="mt-3">
            Bu Kullanım Koşulları, Türkiye Cumhuriyeti kanunları uyarınca hazırlanmıştır ve ilgili tüm yerel ve 
            uluslararası yasalar kapsamında uygulanır. Bu koşullar, Site ve hizmetlerimiz ile ilgili sizinle aramızdaki 
            tüm anlaşmaları içermektedir.
          </p>
        </div>
      </section>

      {/* Bölümler */}
      <div className="space-y-12">
        {/* Kullanıcı Hesabı */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-500 p-3 rounded-full text-white">
              <FaUserCircle className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Kullanıcı Hesabı</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Sitemizin bazı alanlarına erişmek için bir hesap oluşturmanız gerekebilir. 
                  Hesap oluşturduğunuzda şunları kabul edersiniz:
                </p>
                <ul>
                  <li>
                    Kayıt sırasında doğru, güncel ve eksiksiz bilgiler sağlamak
                  </li>
                  <li>
                    Hesap bilgilerinizi güncel tutmak
                  </li>
                  <li>
                    Hesabınızın gizliliğini korumak ve kullanıcı adınız ve şifreniz dahil, hesap bilgilerinizin güvenliğinden 
                    yalnızca sizin sorumlu olduğunuzu kabul etmek
                  </li>
                  <li>
                    Hesabınızla ilgili her türlü etkinlikten yalnızca sizin sorumlu olduğunuzu kabul etmek
                  </li>
                  <li>
                    Hesabınızın yetkisiz kullanımı durumunda derhal bizi bilgilendirmek
                  </li>
                </ul>
                <p className="mt-3">
                  Kaşarcım, herhangi bir nedenle ve önceden bildirimde bulunmaksızın herhangi bir kullanıcı hesabını 
                  askıya alma veya sonlandırma hakkını saklı tutar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Site Kullanım Kuralları */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-500 p-3 rounded-full text-white">
              <FaBalanceScale className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Site Kullanım Kuralları</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Sitemizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:
                </p>
                <ul>
                  <li>
                    Site'yi yasalara uygun şekilde ve yalnızca meşru amaçlar için kullanmak
                  </li>
                  <li>
                    Kaşarcım veya üçüncü tarafların fikri mülkiyet haklarını ihlal etmemek
                  </li>
                  <li>
                    Site'nin normal işleyişini engelleyecek, zarar verecek veya aşırı yük bindirecek 
                    şekilde kullanmamak
                  </li>
                  <li>
                    Yasadışı, tehdit edici, müstehcen içerik yayınlamamak veya dağıtmamak
                  </li>
                  <li>
                    Başkalarının kişisel bilgilerini izinsiz toplamak, paylaşmak veya depolamak için Site'yi kullanmamak
                  </li>
                  <li>
                    Site'nin güvenlik önlemlerini atlatmaya veya manipüle etmeye çalışmamak
                  </li>
                </ul>
                <p className="mt-3">
                  Bu kuralları ihlal etmeniz durumunda, Kaşarcım, Site'ye erişiminizi sınırlama veya tamamen 
                  engelleme hakkını saklı tutar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fikri Mülkiyet Hakları */}
        <section className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-green-500 p-3 rounded-full text-white">
              <FaCopyright className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Fikri Mülkiyet Hakları</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Site ve içeriği (metinler, grafikler, logolar, simgeler, resimler, ses klipleri, dijital indirmeler, 
                  veri derlemeleri ve yazılım dahil) Kaşarcım'a veya lisans verenlerine aittir ve Türkiye ve uluslararası 
                  telif hakkı, ticari marka ve diğer fikri mülkiyet yasaları tarafından korunmaktadır.
                </p>
                <p className="mt-3">
                  <strong>Siteden içerik kullanımı konusunda şunlar yasaktır:</strong>
                </p>
                <ul>
                  <li>
                    Site içeriğini kopyalamak, çoğaltmak, değiştirmek, dağıtmak, yayınlamak, sergilemek, 
                    iletmek veya ticari amaçlarla kullanmak (Kaşarcım'ın önceden açık yazılı izni olmadan)
                  </li>
                  <li>
                    Site içeriğini başka bir web sitesinde veya ağa bağlı bilgisayar ortamında kullanmak
                  </li>
                  <li>
                    Kaşarcım ticari markalarını önceden yazılı izin almadan kullanmak
                  </li>
                </ul>
                <p className="mt-3">
                  Kaşarcım logolarının, düzen tasarımının ve görünümünün izinsiz kullanımı kesinlikle yasaktır. 
                  Sağlanan bağlantılar dahil olmak üzere Kaşarcım içeriğine yapılan atıf ve alıntılar uygun 
                  şekilde belirtilmelidir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ürünler ve Siparişler */}
        <section className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-500 p-3 rounded-full text-white">
              <FaShoppingCart className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Ürünler ve Siparişler</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Site'de sunulan ürünler hakkındaki bilgilere ilişkin olarak:
                </p>
                <ul>
                  <li>
                    Kaşarcım, ürün açıklamalarını mümkün olduğunca doğru ve eksiksiz tutmaya çalışır, 
                    ancak ürün bilgilerinde hatalar veya eksiklikler olabileceğini kabul edersiniz.
                  </li>
                  <li>
                    Ürün görselleri yalnızca gösterim amaçlıdır ve gerçek ürün görünümünde küçük farklılıklar olabilir.
                  </li>
                  <li>
                    Kaşarcım, herhangi bir zamanda, herhangi bir ürün veya hizmeti değiştirme, 
                    sınırlama veya durdurma hakkını saklı tutar.
                  </li>
                </ul>

                <p className="mt-3"><strong>Sipariş ve Fiyatlandırma Politikası:</strong></p>
                <ul>
                  <li>
                    Tüm siparişler, stok uygunluğuna tabidir.
                  </li>
                  <li>
                    Fiyatlar herhangi bir zamanda ve önceden bildirimde bulunmaksızın değiştirilebilir.
                  </li>
                  <li>
                    Ürün fiyatlarına KDV dahildir. Kargo ücretleri ayrıca belirtilecektir.
                  </li>
                  <li>
                    Kaşarcım, bariz fiyat hatası (yanlış fiyatlandırma) durumlarında siparişi iptal etme 
                    veya doğru fiyatla onay isteme hakkını saklı tutar.
                  </li>
                  <li>
                    Bir sipariş verildiğinde, sipariş onaylandıktan sonra bir sipariş numarası ve e-posta 
                    onayı alacaksınız. Ancak, Kaşarcım tarafından onaylanana kadar sipariş nihai değildir.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Ödeme Koşulları */}
        <section className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-500 p-3 rounded-full text-white">
              <FaCreditCard className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Ödeme Koşulları</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Kaşarcım, çeşitli ödeme yöntemleri sunmaktadır. Ödeme işlemleri hakkında aşağıdaki 
                  koşulları kabul edersiniz:
                </p>
                <ul>
                  <li>
                    Kaşarcım, herhangi bir ödeme yöntemini herhangi bir zamanda değiştirme, 
                    ekleme veya kaldırma hakkını saklı tutar.
                  </li>
                  <li>
                    Ödeme bilgilerinizin doğru ve eksiksiz olduğunu onaylarsınız.
                  </li>
                  <li>
                    Kredi kartı veya banka kartı ile ödeme yaparken, kart sahibinin onayına sahip olduğunuzu beyan edersiniz.
                  </li>
                  <li>
                    Ödeme işlemi, güvenli ödeme sistemlerimiz aracılığıyla gerçekleştirilir ve ödeme 
                    bilgileriniz şifrelenerek korunur.
                  </li>
                </ul>
                <p className="mt-3">
                  Ödeme işlemi onaylandıktan sonra, sipariş işleme alınacaktır. Ödeme onayı alınamadığında 
                  siparişiniz işleme alınmayacaktır.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* İptal ve İade Politikası */}
        <section className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-teal-500 p-3 rounded-full text-white">
              <FaExchangeAlt className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">İptal ve İade Politikası</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Siparişinizin iptali veya ürünlerin iadesi konusunda aşağıdaki koşullar geçerlidir:
                </p>
                <ul>
                  <li>
                    <strong>Sipariş İptali:</strong> Siparişiniz hazırlanmaya başlamadan önce iptal edebilirsiniz. 
                    Kargoya verilen siparişler iptal edilemez.
                  </li>
                  <li>
                    <strong>İade Koşulları:</strong> Ürünleri teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz. 
                    Ancak, gıda ürünlerinde hijyen ve sağlık açısından, ambalajı açılmış ürünler iade kabul edilmemektedir.
                  </li>
                  <li>
                    <strong>Hatalı/Hasarlı Ürünler:</strong> Ürünlerde herhangi bir hasar, bozulma veya yanlış ürün gönderimi 
                    durumunda, teslim aldığınız tarihten itibaren 24 saat içinde bize bildirmeniz gerekmektedir.
                  </li>
                  <li>
                    <strong>İade Süreci:</strong> İade talebinizi müşteri hizmetlerimize iletmeniz gerekmektedir. 
                    İade onaylandıktan sonra, ürünleri orijinal ambalajında ve faturasıyla birlikte belirtilen adrese 
                    göndermeniz gerekir.
                  </li>
                </ul>
                <p className="mt-3">
                  Ürün iade edildiğinde ve inceleme sonucunda iade koşullarına uygun bulunduğunda, ödemeniz 
                  aynı ödeme yöntemi ile en geç 14 gün içinde iade edilecektir. İade kargo ücretleri, 
                  ürün hatası durumunda Kaşarcım tarafından, müşteri kaynaklı iade durumlarında müşteri 
                  tarafından karşılanır.
                </p>
                <p className="mt-3">
                  Detaylı iade politikamız için lütfen <Link href="/iade-politikasi" className="text-teal-600 hover:underline">İade Politikası</Link> sayfamızı ziyaret edin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sorumluluk Sınırlaması */}
        <section className="bg-gradient-to-r from-rose-50 to-rose-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-rose-500 p-3 rounded-full text-white">
              <FaInfoCircle className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Sorumluluk Sınırlaması</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Kaşarcım'ın sorumluluğu konusunda aşağıdaki sınırlamalar geçerlidir:
                </p>
                <ul>
                  <li>
                    Kaşarcım, Site'nin veya hizmetlerinin kesintisiz, hatasız veya güvenli olacağını garanti etmez.
                  </li>
                  <li>
                    Site'ye erişememe veya Site'nin kullanımından kaynaklanan zararlardan Kaşarcım sorumlu değildir.
                  </li>
                  <li>
                    Kaşarcım, üçüncü taraf web sitelerine bağlantıların içeriğinden, gizlilik politikalarından 
                    veya uygulamalarından sorumlu değildir.
                  </li>
                  <li>
                    Kaşarcım, Site veya hizmetlerini kullanmanızdan kaynaklanan doğrudan, dolaylı, tesadüfi, 
                    özel veya sonuçsal zararlardan sorumlu tutulamaz.
                  </li>
                </ul>
                <p className="mt-3">
                  Kaşarcım'ın sorumluluğu, hiçbir durumda, ürünler için ödediğiniz toplam miktarı aşamaz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Uyuşmazlık Çözümü */}
        <section className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-500 p-3 rounded-full text-white">
              <FaGavel className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Uyuşmazlık Çözümü</h2>
              <div className="prose max-w-none text-gray-600">
                <p>
                  Bu Kullanım Koşulları'ndan kaynaklanan herhangi bir uyuşmazlık durumunda, öncelikle 
                  karşılıklı görüşmeler yoluyla çözüm aranacaktır. Çözüme ulaşılamaması halinde:
                </p>
                <ul>
                  <li>
                    Tüketici hakem heyetleri ve tüketici mahkemeleri, tüketici uyuşmazlıklarında yetkilidir.
                  </li>
                  <li>
                    Bu koşulların yorumlanması ve uygulanmasında Türkiye Cumhuriyeti yasaları geçerli olacaktır.
                  </li>
                  <li>
                    Diğer tüm uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Değişiklikler */}
      <section className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Kullanım Koşullarında Değişiklikler</h2>
        <p className="text-gray-600">
          Kaşarcım, bu Kullanım Koşulları'nı herhangi bir zamanda değiştirme hakkını saklı tutar. 
          Tüm değişiklikler, Site'de yayınlandıkları anda yürürlüğe girer. Değişikliklerden sonra Site'yi 
          kullanmaya devam etmeniz, güncellenmiş Kullanım Koşulları'nı kabul ettiğiniz anlamına gelir.
        </p>
        <p className="mt-3 text-gray-600">
          Bu koşullarda önemli değişiklikler yapıldığında, sizi bilgilendirmek için makul çaba göstereceğiz, 
          ancak düzenli olarak bu sayfayı kontrol etmeniz ve güncellemeleri takip etmeniz önerilir.
        </p>
      </section>

      {/* İletişim */}
      <section className="mt-8 text-center">
        <p className="text-gray-600">
          Bu Kullanım Koşulları hakkında sorularınız varsa, lütfen bizimle iletişime geçin:
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