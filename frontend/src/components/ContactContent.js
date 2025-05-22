"use client";

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaExclamationTriangle, FaPaperPlane, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { api } from '@/services';

const infoCards = [
  {
    icon: FaMapMarkerAlt,
    title: 'Adresimiz',
    content: (
      <>
        Güleser Sk. Hüseyin Apt. <br />
        Soğukpınar Mahallesi <br /> No:4 Kat:4<br />
        34788 Çekmeköy / İstanbul 
      </>
    ),
    color: 'bg-gradient-to-r from-orange-500 to-orange-600'
  },
  {
    icon: FaPhone,
    title: 'Telefonumuz',
    content: (
      <>
        +90 536 988 69 12<br />
        +90 552 396 31 41
      </>
    ),
    color: 'bg-gradient-to-r from-blue-500 to-blue-600'
  },
  {
    icon: FaEnvelope,
    title: 'E-posta Adresimiz',
    content: (
      <>
        info@kasarcim.com
      </>
    ),
    color: 'bg-gradient-to-r from-green-500 to-green-600'
  },
  {
    icon: FaClock,
    title: 'Çalışma Saatlerimiz',
    content: (
      <>
        Pazartesi-Cuma: 09:00 - 18:00<br />
        Cumartesi: 09:00 - 14:00<br />
        Pazar: Kapalı
      </>
    ),
    color: 'bg-gradient-to-r from-purple-500 to-purple-600'
  }
];

const subjectOptions = [
  '',
  'Sipariş',
  'Ürün Bilgisi',
  'Bayi Başvurusu',
  'İşbirliği',
  'Diğer'
];

export default function ContactContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [focused, setFocused] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFocus = (field) => {
    setFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setFocused(prev => ({ ...prev, [field]: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSubmitStatus({ success: false, message: 'Lütfen tüm zorunlu alanları doldurun.' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // api servisi ile iletişim formunu gönder
      await api.post('contact/', formData);
      
      setSubmitStatus({ success: true, message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.' });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
      if (err.data && err.data.detail) {
        errorMessage = err.data.detail;
      }
      setSubmitStatus({ success: false, message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Başarılı mesaj gönderdikten sonra statusu temizleme
  useEffect(() => {
    if (submitStatus?.success) {
      const timer = setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  return (
    <div className="bg-gray-50">
      {/* Hero Başlık */}
      <div className="max-w-7xl mx-auto px-12 sm:px-6 lg:px-8 mb-12 pb-12 pt-24">
        <div className="text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">İletişime Geçin</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Sorularınız, önerileriniz veya siparişleriniz için bizimle iletişime geçebilirsiniz.
            Size yardımcı olmaktan memnuniyet duyarız.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Üstte bilgi kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {infoCards.map((card, i) => (
            <div 
              key={i} 
              className="bg-white rounded-xl p-6 flex flex-col items-center text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group"
            >
              <div className={`absolute inset-x-0 h-2 top-0 ${card.color}`}></div>
              <div className={`${card.color} text-white rounded-full w-16 h-16 flex items-center justify-center mb-4 text-2xl shadow-md`}>
                <card.icon />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-3">{card.title}</h3>
              <div className="text-gray-600 text-base leading-relaxed">{card.content}</div>
              <div className={`absolute inset-0 ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Altta iki sütun: form ve harita */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 flex flex-col justify-center min-h-[480px] border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Bize Mesaj Gönderin</h2>
            <p className="text-gray-600 mb-8">Aşağıdaki formu doldurarak bize ulaşabilirsiniz.</p>
            
            {submitStatus && (
              <div 
                className={`mb-6 p-4 rounded-lg flex items-start ${
                  submitStatus.success 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {submitStatus.success 
                    ? <FaCheckCircle className="h-5 w-5 text-green-500" /> 
                    : <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                  }
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{submitStatus.message}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor="name" className={`block text-sm font-medium mb-2 transition-colors duration-200 ${focused.name ? 'text-orange-600' : 'text-gray-700'}`}>
                    Adınız Soyadınız *
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')} 
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-all duration-200 text-gray-800 text-base ${
                      focused.name 
                        ? 'border-orange-400 ring-2 ring-orange-100 bg-white' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    required 
                  />
                </div>
                <div className="relative">
                  <label htmlFor='email' className={`block text-sm font-medium mb-2 transition-colors duration-200 ${focused.email ? 'text-orange-600' : 'text-gray-700'}`}>
                    E-posta Adresiniz *
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')} 
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-all duration-200 text-gray-800 text-base ${
                      focused.email 
                        ? 'border-orange-400 ring-2 ring-orange-100 bg-white' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor='phone' className={`block text-sm font-medium mb-2 transition-colors duration-200 ${focused.phone ? 'text-orange-600' : 'text-gray-700'}`}>
                    Telefon Numaranız
                  </label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    onFocus={() => handleFocus('phone')}
                    onBlur={() => handleBlur('phone')} 
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-all duration-200 text-gray-800 text-base ${
                      focused.phone 
                        ? 'border-orange-400 ring-2 ring-orange-100 bg-white' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  />
                </div>
                <div className="relative">
                  <label htmlFor='subject' className={`block text-sm font-medium mb-2 transition-colors duration-200 ${focused.subject ? 'text-orange-600' : 'text-gray-700'}`}>
                    Konu *
                  </label>
                  <div className="relative">
                    <select 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleChange}
                      onFocus={() => handleFocus('subject')}
                      onBlur={() => handleBlur('subject')} 
                      className={`w-full appearance-none border rounded-lg px-4 py-3 focus:outline-none transition-all duration-200 text-gray-800 text-base pr-10 ${
                        focused.subject 
                          ? 'border-orange-400 ring-2 ring-orange-100 bg-white' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      required
                    >
                      <option value="">Seçiniz</option>
                      {subjectOptions.slice(1).map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${focused.message ? 'text-orange-600' : 'text-gray-700'}`}>
                  Mesajınız *
                </label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')} 
                  rows={5} 
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none transition-all duration-200 text-gray-800 text-base resize-none ${
                    focused.message 
                      ? 'border-orange-400 ring-2 ring-orange-100 bg-white' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-lg font-semibold text-lg shadow transition-all duration-300 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Mesajı Gönder
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                * ile işaretlenmiş alanlar zorunludur
              </p>
            </form>
          </div>
          
          {/* Harita ve Sosyal Medya */}
          <div className="flex flex-col space-y-6">
            {/* Harita */}
            <div className="bg-white shadow-xl p-8 md:p-10 flex flex-col items-center justify-center border border-gray-200 rounded-xl relative flex-grow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-xl"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Bizi Ziyaret Edin</h2>
              <p className="text-gray-600 mb-6 text-center">Peynir dünyasını keşfetmek için mağazamıza bekleriz.</p>
              <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                  title="Kaşarcım Harita"
                  src="https://www.google.com/maps?q=Soğukpınar,+Güleser+Sk.+No:4,+34788+Çekmeköy/İstanbul&output=embed"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
            
            {/* Sosyal Medya */}
            <div className="bg-white  shadow-xl p-8 flex flex-col items-center justify-center border border-gray-200 rounded-xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-t-xl"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Bizi Takip Edin</h2>
              <p className="text-gray-600 mb-6 text-center">En son ürünlerimiz, kampanyalarımız ve etkinliklerimizden haberdar olmak için sosyal medya hesaplarımızı takip edin.</p>
              <div className="flex space-x-5">
                <a href="https://facebook.com/kasarcim" aria-label='Facebook Sayfasına Git' target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md transition-all duration-300 hover:scale-110">
                  <FaFacebookF />
                </a>
                <a href="https://twitter.com/kasarcim" aria-label='Twitter Sayfasına Git' target="_blank" rel="noopener noreferrer" className="bg-sky-500 hover:bg-sky-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md transition-all duration-300 hover:scale-110">
                  <FaTwitter />
                </a>
                <a href="https://instagram.com/kasarcim" aria-label='İnstagram Sayfasına Git'  target="_blank" rel="noopener noreferrer" className="bg-gradient-to-tr from-purple-500 via-red-500 to-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md transition-all duration-300 hover:scale-110">
                  <FaInstagram />
                </a>
                <a href="https://linkedin.com/company/kasarcim" aria-label='LinkedIn Sayfasına Git' target="_blank" rel="noopener noreferrer" className="bg-blue-700 hover:bg-blue-800 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md transition-all duration-300 hover:scale-110">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sık Sorulan Sorulara Yönlendirme */}
        <div className="mt-16 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 md:p-10 text-center shadow-sm border border-amber-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sorularınız mı var?</h2>
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
            Sık sorulan sorular sayfamızda peynir ürünlerimiz, teslimat süreçlerimiz ve diğer konular hakkında detaylı bilgiler bulabilirsiniz.
          </p>
          <a href="/sikca-sorulan-sorular" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors">
            Sıkça Sorulan Sorular
          </a>
        </div>
      </div>
    </div>
  );
} 