"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { FaCheckCircle, FaArrowLeft, FaHome, FaBoxOpen, FaCopy, FaCheck, FaCreditCard, FaMoneyBillAlt, FaTruck } from 'react-icons/fa';
import Loader from '../components/Loader';

// Bildirimlerin giriş/çıkış animasyonları için CSS
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.3s ease-out forwards;
  }
  
  .animate-fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }

  .order-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .gradient-bg {
    background: linear-gradient(135deg, #ff8a00, #ff6a00);
  }
  
  .floating-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .floating-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  }
  
  .pulse-effect {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export default function SiparisBasariliPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orderInfo, setOrderInfo] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [copyingIban, setCopyingIban] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer'); // Varsayılan ödeme yöntemi
  

 
  // IBAN kopyalama işlevi
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyingIban(true);
      
      // Toast bildirimi için tarayıcı API'sini kullanalım
      if (typeof document !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-50 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up';
        notification.innerHTML = '<div class="flex items-center"><svg class="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>IBAN kopyalandı</div>';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.classList.add('animate-fade-out');
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 500);
        }, 2000);
      }
      
      // 2 saniye sonra kopyalama durumunu sıfırla
      setTimeout(() => {
        setCopyingIban(false);
      }, 2000);
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
      
      // Hata bildirimi
      if (typeof document !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-red-50 text-red-800 px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up';
        notification.innerHTML = '<div class="flex items-center"><svg class="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>Kopyalama başarısız oldu</div>';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.classList.add('animate-fade-out');
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 500);
        }, 2000);
      }
    }
  };
  
  // Client-side rendering için
  useEffect(() => {
    setMounted(true);
    
    // CSS stillerini ekle
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = customStyles;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
  
  // URL'den sipariş bilgilerini al - ayrı bir useEffect içinde
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const orderId = searchParams.get('orderId');
        const totalAmount = searchParams.get('total');
        const paymentMethodParam = searchParams.get('paymentMethod');

        // Ödeme yöntemi parametresini kontrol et ve ayarla
        if (paymentMethodParam) {
          setPaymentMethod(paymentMethodParam);
        }

        console.log("URL Parametreleri:", { orderId, totalAmount, paymentMethod: paymentMethodParam });
        
        // Hata ayıklama bilgileri
        setDebugInfo({
          orderId,
          totalAmount,
          paymentMethod: paymentMethodParam,
          orderIdType: typeof orderId,
          isOrderIdTruthy: !!orderId
        });
        
        // orderId geçerli bir değer mi kontrol et (daha esnek bir kontrol)
        if (orderId && orderId !== 'undefined' && orderId !== 'null') {
          const orderIdNum = parseInt(orderId);
          console.log("İşlenen Sipariş ID:", orderIdNum);
          
          if (!isNaN(orderIdNum)) {
            setOrderInfo({
              id: orderIdNum + 91185,
              total: totalAmount ? parseFloat(totalAmount) : 0,
            });
          } else {
            console.error("Sipariş ID sayıya dönüştürülemedi:", orderId);
          }
        } else {
          console.warn("Sipariş ID bulunamadı, ana sayfaya yönlendiriliyor");
        }
      } catch (error) {
        console.error("Sipariş bilgisi işlenirken hata:", error);
      }
    }
  }, [mounted]); // mounted değiştiğinde çalışsın
  
  // Kullanıcı kontrolünü kaldırdık - misafir kullanıcılar da sipariş tamamlayabilir
  useEffect(() => {
    if (mounted && !authLoading) {
      console.log("Kullanıcı durumu:", user ? "Giriş yapılmış" : "Misafir kullanıcı");
    }
  }, [mounted, authLoading, user]);
  
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <Loader size="large" />
      </div>
    );
  }
  
  if (!orderInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Sipariş bilgisi bulunamadı.</p>
          <p className="text-gray-500 mb-4 text-sm">
            Hata Ayıklama Bilgileri: {JSON.stringify(debugInfo)}
          </p>
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-medium">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }
  
  // Ödeme yöntemine göre ikonları ve mesajları belirle
  const getPaymentIcon = () => {
    switch(paymentMethod) {
      case 'bank_transfer':
        return <FaMoneyBillAlt className="h-8 w-8 text-orange-500" />;
      case 'credit_card':
        return <FaCreditCard className="h-8 w-8 text-orange-500" />;
      case 'cash_on_delivery':
        return <FaTruck className="h-8 w-8 text-orange-500" />;
      default:
        return <FaMoneyBillAlt className="h-8 w-8 text-orange-500" />;
    }
  };
  
  const getPaymentTitle = () => {
    switch(paymentMethod) {
      case 'bank_transfer':
        return "Banka Havalesi / EFT";
      case 'credit_card':
        return "Kredi Kartı";
      case 'cash_on_delivery':
        return "Kapıda Ödeme";
      default:
        return "Ödeme";
    }
  };
  
  const getPaymentMessage = () => {
    switch(paymentMethod) {
      case 'bank_transfer':
        return "Lütfen aşağıdaki banka hesabına sipariş tutarını, sipariş numaranızı açıklamada belirterek gönderiniz.";
      case 'credit_card':
        return "Kredi kartı ödemesi başarıyla tamamlandı. Siparişiniz hazırlanıyor.";
      case 'cash_on_delivery':
        return "Siparişiniz hazırlandıktan sonra kargoya verilecek ve teslimat sırasında ödeme yapabileceksiniz.";
      default:
        return "Ödemeniz alındı, siparişiniz hazırlanıyor.";
    }
  };
  
  return (
    <div className="py-6 sm:py-12 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="order-card floating-card max-w-4xl mx-auto overflow-hidden">
        {/* Üst Banner Bölümü */}
        <div className="gradient-bg text-white p-4 sm:p-8 text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FaCheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500 font-bold" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Siparişiniz Başarıyla Oluşturuldu!</h1>
          <p className="text-lg sm:text-xl text-white text-opacity-90 mb-2">
            Siparişiniz alındı ve işleme konuldu
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 sm:mt-6">
            <div className="bg-white bg-opacity-15 px-4 py-2 rounded-full w-full sm:w-auto">
              <p className="text-orange-500 font-bold">
                Sipariş No: <span className="font-bold">#{orderInfo.id}</span>
          </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-full w-full sm:w-auto">
              <p className="text-orange-500 font-bold">
            {orderInfo.total.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            })}
              </p>
            </div>
          </div>
          <div className="mt-3">
            {user ? (
              <p className="text-sm text-white text-opacity-80">
                Hesap: {user.email || user.name}
              </p>
            ) : (
              <p className="text-sm text-white text-opacity-80">
                Misafir kullanıcı olarak sipariş verdiniz
              </p>
            )}
          </div>
        </div>
        
        {/* Ana İçerik */}
        <div className="p-4 sm:p-8 bg-white">
          {/* Ödeme Bilgileri Kartı */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                {getPaymentIcon()}
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{getPaymentTitle()}</h2>
            </div>
          
            <div className="bg-gray-50 rounded-xl p-3 sm:p-5 border border-gray-100">
              <p className="text-gray-600 mb-3 text-sm sm:text-base">
                {getPaymentMessage()}
              </p>
              
              {/* Banka havalesi bilgileri (sadece banka havalesi seçiliyse göster) */}
              {paymentMethod === 'bank_transfer' && (
                <>
                  {/* Mobil için sadeleştirilmiş kart içeriği */}
                  <div className="bg-white rounded-lg p-3 sm:p-5 border border-gray-200 mb-4 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-24 text-xs text-gray-500">Banka Adı:</div>
                        <div className="font-medium text-gray-800">Enpara</div>
                </div>
                      <div className="flex items-center">
                        <div className="w-24 text-xs text-gray-500">Şube:</div>
                        <div className="font-medium text-gray-800">Çekmeköy (0070)</div>
                </div>
                      <div className="flex items-center">
                        <div className="w-24 text-xs text-gray-500">Hesap Sahibi:</div>
                        <div className="font-medium text-gray-800">Ramazan Deniz Sağ</div>
                </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">IBAN:</div>
                        {/* Mobil ekranlarda dikey düzen, masaüstünde yatay düzen */}
                        <div className="block sm:flex sm:items-center">
                          <div className="bg-gray-50 rounded-lg py-2 px-2 border border-gray-200 w-full select-all mb-2 sm:mb-0">
                            <p className="font-mono text-xs sm:text-sm break-all">TR72 0011 1000 0000 0070 5463 42</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard('TR72 0011 1000 0000 0070 5463 42')}
                            className="w-full sm:w-auto sm:ml-2 py-2 px-3 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition-colors flex items-center justify-center"
                      title="IBAN'ı Kopyala"
                    >
                      {copyingIban ? (
                        <>
                                <FaCheck className="sm:mr-1" />
                                <span className="ml-1 sm:ml-0">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                                <FaCopy className="sm:mr-1" />
                                <span className="ml-1 sm:ml-0">Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 flex items-start">
                    <div className="mr-1 mt-0.5 text-yellow-600 flex-shrink-0">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm">
                      <strong>Önemli:</strong> Ödeme yaparken açıklama kısmına sipariş numaranızı (#{orderInfo.id}) yazmayı unutmayınız.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Diğer Bilgiler */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-800">Sipariş Takibi</h3>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-gray-600 text-xs sm:text-sm">
              Siparişinizle ilgili güncellemeler size e-posta yoluyla gönderilecektir.
                Herhangi bir sorunuz olursa 
                <Link href="/iletisim" className="text-orange-500 hover:text-orange-600 mx-1 font-medium">
                  iletişime geçin
                </Link>.
            </p>
            </div>
          </div>
        </div>
        
        {/* Alt Butonlar */}
        <div className="bg-gray-50 p-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            href="/" 
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2 sm:py-3 border border-transparent rounded-lg shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors text-sm"
          >
            <FaHome className="mr-2" />
            Ana Sayfaya Dön
          </Link>
          
          {user ? (
            <Link 
              href={`/siparisler/${orderInfo.id}`} 
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2 sm:py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors text-sm"
            >
            <FaBoxOpen className="mr-2" />
            Sipariş Detayları
          </Link>
          ) : (
            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2 sm:py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors text-sm"
            >
              <FaBoxOpen className="mr-2" />
              Üye Olarak Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 