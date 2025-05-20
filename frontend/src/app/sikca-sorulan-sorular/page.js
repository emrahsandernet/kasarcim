"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp, FaShoppingCart, FaCreditCard, FaShippingFast, FaBox, FaCheese, FaExchangeAlt } from 'react-icons/fa';

export default function SikcaSorulanSorular() {
  const [openCategory, setOpenCategory] = useState('siparis');
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const toggleQuestion = (id) => {
    setOpenQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = [
    {
      id: 'siparis',
      title: 'Sipariş ve Ödeme',
      icon: <FaShoppingCart className="text-orange-500" />,
      questions: [
        {
          id: 'siparis-1',
          question: 'Nasıl sipariş verebilirim?',
          answer: 'Sitemizden sipariş vermek oldukça kolaydır. İstediğiniz ürünleri seçip sepetinize ekledikten sonra, "Sepete Git" butonuna tıklayıp ödeme adımlarını takip etmeniz yeterlidir. Ödeme sayfasında teslimat bilgilerinizi girip, ödeme yönteminizi seçerek siparişinizi tamamlayabilirsiniz.'
        },
        {
          id: 'siparis-2',
          question: 'Hangi ödeme yöntemlerini kullanabilirim?',
          answer: 'Sitemizde kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini kullanabilirsiniz. Tüm kredi kartlarına taksit imkanımız bulunmaktadır. Ödeme sayfasında size uygun olan ödeme yöntemini seçebilirsiniz.'
        },
        {
          id: 'siparis-3',
          question: 'Siparişimin durumunu nasıl takip edebilirim?',
          answer: 'Siparişinizi vermek için hesap oluşturduysanız, hesabınıza giriş yaparak "Siparişlerim" sayfasından tüm siparişlerinizin durumunu takip edebilirsiniz. Ayrıca, siparişiniz kargoya verildiğinde size e-posta ve SMS ile kargo takip numarası gönderilecektir.'
        },
        {
          id: 'siparis-4',
          question: 'Siparişimi iptal edebilir miyim?',
          answer: 'Siparişiniz hazırlanma aşamasında ise iptal edebilirsiniz. Bunun için "Siparişlerim" sayfasından ilgili siparişin detaylarına giderek iptal talebinde bulunabilirsiniz. Siparişiniz kargoya verildikten sonra iptal yerine iade işlemi başlatmanız gerekecektir.'
        }
      ]
    },
    {
      id: 'teslimat',
      title: 'Kargo ve Teslimat',
      icon: <FaShippingFast className="text-orange-500" />,
      questions: [
        {
          id: 'teslimat-1',
          question: 'Kargo ücretleri ne kadar?',
          answer: '150 TL ve üzeri tüm siparişlerde kargo ücretsizdir. 150 TL altı siparişlerde ise kargo ücreti 29.90 TL\'dir. Özel soğutmalı teslimat gerektiren bazı peynir çeşitleri için ekstra kargo ücreti alınabilir, bu ürünlerin sayfalarında belirtilmektedir.'
        },
        {
          id: 'teslimat-2',
          question: 'Siparişim ne zaman elime ulaşır?',
          answer: 'Siparişleriniz, ödemenizin onaylanmasından sonra genellikle 1-2 iş günü içinde hazırlanıp kargoya verilir. Bulunduğunuz bölgeye göre teslimat süresi 1-3 iş günü arasında değişebilir. Özel soğutmalı kargo ile gönderilen peynirler için bu süre farklılık gösterebilir.'
        },
        {
          id: 'teslimat-3',
          question: 'Peynirlerin tazeliği kargo sürecinde nasıl korunuyor?',
          answer: 'Tüm peynir ürünlerimiz özel soğutmalı paketleme sistemimizle hazırlanıp, soğuk zincir bozulmadan size ulaştırılmaktadır. Ürünlerimiz, özel yalıtımlı kutular ve buz paketleri ile paketlenerek tazeliğini ve lezzetini korumaktadır.'
        },
        {
          id: 'teslimat-4',
          question: 'Hangi bölgelere teslimat yapıyorsunuz?',
          answer: 'Türkiye\'nin her yerine teslimat yapmaktayız. Ancak bazı uzak bölgeler veya adalar için teslimat süresi uzayabilir ve ek kargo ücreti talep edilebilir. Soğuk zincir teslimatı yapılamayacak çok uzak bölgelere bazı ürünlerin gönderimi yapılmayabilir.'
        }
      ]
    },
    {
      id: 'urunler',
      title: 'Ürünler Hakkında',
      icon: <FaCheese className="text-orange-500" />,
      questions: [
        {
          id: 'urunler-1',
          question: 'Peynirlerinizin son kullanma tarihi ne kadardır?',
          answer: 'Peynirlerimizin son kullanma tarihleri çeşidine göre değişiklik göstermektedir. Taze peynirler 7-10 gün, olgunlaştırılmış peynirler ise 30-60 gün tazeliğini koruyabilmektedir. Her ürünün detay sayfasında tavsiye edilen tüketim süresi belirtilmektedir. Ayrıca gönderilen her ürünün paketinde son kullanma tarihi yer almaktadır.'
        },
        {
          id: 'urunler-2',
          question: 'Peynirler nasıl muhafaza edilmelidir?',
          answer: 'Peynirlerimizi, hava almayan bir kapta veya streç filmle sarılı şekilde buzdolabında (2-4°C) saklamanızı öneririz. Taze peynirler buzdolabının alt raflarında, olgunlaştırılmış peynirler ise sebzelikten uzak raflarda muhafaza edilmelidir. Küflü peynirlerin ayrı kaplarda saklanması önerilir.'
        },
        {
          id: 'urunler-3',
          question: 'Peynirleriniz katkı maddesi içeriyor mu?',
          answer: 'Peynirlerimiz geleneksel yöntemlerle üretilmekte olup, koruyucu, renklendirici veya kıvam arttırıcı katkı maddeleri içermez. Sadece peynir mayası, starter kültür ve geleneksel üretim için gerekli olan doğal içerikler kullanılmaktadır. Tüm ürünlerimizin içerik bilgileri detay sayfalarında belirtilmiştir.'
        },
        {
          id: 'urunler-4',
          question: 'Laktoz intoleransım var, tüketebileceğim peynirler var mı?',
          answer: 'Evet, olgunlaşma süreci uzun olan sert peynirlerimiz (eski kaşar, parmesan, vs.) laktoz içeriği çok düşük olduğu için laktoz intoleransı olan kişiler tarafından genellikle tolere edilebilir. Ancak hassasiyetinizin derecesine bağlı olarak doktorunuza danışmanızı öneririz. Ürün sayfalarımızda laktoz içeriğiyle ilgili bilgiler bulabilirsiniz.'
        }
      ]
    },
    {
      id: 'iade',
      title: 'İade ve Değişim',
      icon: <FaExchangeAlt className="text-orange-500" />,
      questions: [
        {
          id: 'iade-1',
          question: 'Ürün iade koşulları nelerdir?',
          answer: 'Ürünlerimizi, teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz. Ancak gıda ürünlerinde, teslim sonrası açılmış paketler, hijyenik nedenlerle iade edilemez. Ürünün bozuk, hatalı veya hasar görmüş olarak teslimi durumunda, paketi açmadan fotoğraflayıp müşteri hizmetlerimizle iletişime geçmeniz gerekmektedir.'
        },
        {
          id: 'iade-2',
          question: 'İade sürecini nasıl başlatabilirim?',
          answer: 'İade sürecini başlatmak için hesabınıza giriş yapıp "Siparişlerim" sayfasından ilgili siparişin detaylarına giderek iade talebinde bulunabilirsiniz. Alternatif olarak, müşteri hizmetleri hattımızı arayarak da iade sürecini başlatabilirsiniz. İade talebinizin onaylanmasından sonra, size bildirilen adrese ürünü göndermeniz gerekmektedir.'
        },
        {
          id: 'iade-3',
          question: 'İade ettiğim ürünün parası ne zaman iade edilir?',
          answer: 'İade ettiğiniz ürünler bize ulaştıktan ve kontrol edildikten sonra, genellikle 7-10 iş günü içerisinde ödeme iadesi gerçekleştirilir. Kredi kartıyla yapılan ödemelerde, paranın kartınıza yansıması bankanızın süreçlerine bağlı olarak 1-2 ekstrenizi bulabilir.'
        },
        {
          id: 'iade-4',
          question: 'Ürünü beğenmezsem iade edebilir miyim?',
          answer: 'Peynir gibi gıda ürünlerinde, paket açıldıktan sonra beğenmeme nedeniyle iade kabul edilmemektedir. Ancak ürün beklentilerinizi karşılamadıysa, müşteri memnuniyeti politikamız kapsamında durumunuzu değerlendirmek için lütfen müşteri hizmetlerimizle iletişime geçiniz.'
        }
      ]
    },
    {
      id: 'uyelik',
      title: 'Hesap ve Üyelik',
      icon: <FaBox className="text-orange-500" />,
      questions: [
        {
          id: 'uyelik-1',
          question: 'Üye olmadan alışveriş yapabilir miyim?',
          answer: 'Evet, sitemizden üye olmadan da alışveriş yapabilirsiniz. Ancak üye olarak alışveriş yapmak, sipariş takibi, geçmiş siparişlere erişim, hızlı ödeme gibi avantajlar sağlar. Ayrıca üyelerimize özel indirim ve kampanyalardan da faydalanabilirsiniz.'
        },
        {
          id: 'uyelik-2',
          question: 'Şifremi unuttum, ne yapmalıyım?',
          answer: 'Şifrenizi unuttuysanız, giriş sayfasındaki "Şifremi Unuttum" bağlantısına tıklayarak e-posta adresinizi girmeniz yeterlidir. Size şifre yenileme bağlantısı içeren bir e-posta göndereceğiz. Bu bağlantıya tıklayarak yeni bir şifre oluşturabilirsiniz.'
        },
        {
          id: 'uyelik-3',
          question: 'Kişisel bilgilerimi nasıl güncelleyebilirim?',
          answer: 'Hesabınıza giriş yaptıktan sonra, "Hesabım" sayfasındaki "Profil Bilgileri" bölümünden kişisel bilgilerinizi güncelleyebilirsiniz. Adres bilgilerinizi ise "Adres Defteri" bölümünden düzenleyebilir, yeni adresler ekleyebilir veya mevcut adreslerinizi güncelleyebilirsiniz.'
        },
        {
          id: 'uyelik-4',
          question: 'Hesabımı nasıl silebilirim?',
          answer: 'Hesabınızı silmek için "Hesabım" sayfasındaki "Hesap Ayarları" bölümünden hesap silme talebinde bulunabilirsiniz. Alternatif olarak, müşteri hizmetlerimizle iletişime geçerek de hesabınızın silinmesini talep edebilirsiniz. KVKK kapsamında tüm kişisel verileriniz sistemimizden kalıcı olarak silinecektir.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 relative inline-block">
          Sıkça Sorulan Sorular
          <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full transform translate-y-6"></span>
        </h1>
        <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
          Kaşarcım online peynir alışveriş platformu hakkında merak ettiğiniz tüm sorular ve cevapları 
          bu sayfada bulabilirsiniz. Başka sorunuz varsa <Link href="/iletisim" className="text-orange-500 hover:underline">İletişim</Link> sayfamızdan bize ulaşabilirsiniz.
        </p>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div 
              className={`flex justify-between items-center p-4 cursor-pointer ${openCategory === category.id ? 'bg-orange-50' : 'bg-white'}`}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-xl">{category.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800">{category.title}</h3>
              </div>
              <div className="text-orange-500">
                {openCategory === category.id ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {openCategory === category.id && (
              <div className="bg-white divide-y divide-gray-100">
                {category.questions.map((item) => (
                  <div key={item.id} className="border-t border-gray-100">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleQuestion(item.id)}
                    >
                      <p className={`font-medium ${openQuestions[item.id] ? 'text-orange-600' : 'text-gray-700'}`}>
                        {item.question}
                      </p>
                      <div className={`transition-transform ${openQuestions[item.id] ? 'text-orange-500 rotate-180' : 'text-gray-400'}`}>
                        <FaChevronDown className="text-sm" />
                      </div>
                    </div>
                    
                    {openQuestions[item.id] && (
                      <div className="px-4 pb-4 text-gray-600 animate-fadeIn bg-orange-50 bg-opacity-40">
                        <p className="prose max-w-none">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Sorunuzu bulamadınız mı?</h3>
        <p className="text-gray-600 mb-6">
          Merak ettiğiniz başka sorular varsa, müşteri hizmetlerimiz size yardımcı olmaktan memnuniyet duyacaktır.
        </p>
        <Link href="/iletisim" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors">
          Bize Ulaşın
        </Link>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
} 