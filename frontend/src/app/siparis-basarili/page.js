"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { FaCheckCircle, FaArrowLeft, FaHome, FaBoxOpen, FaCopy, FaCheck } from 'react-icons/fa';
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
`;

export default function SiparisBasariliPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orderInfo, setOrderInfo] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [copyingIban, setCopyingIban] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  
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

        console.log("URL Parametreleri:", { orderId, totalAmount });
        
        // Hata ayıklama bilgileri
        setDebugInfo({
          orderId,
          totalAmount,
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
          // 500ms yerine daha uzun bir süre bekle
          console.warn("Sipariş ID bulunamadı, ana sayfaya yönlendiriliyor");
          // Yönlendirmeyi kaldıralım, hata mesajı göstermeyi tercih edelim
          // setTimeout(() => {
          //   window.location.href = '/';
          // }, 3000);
        }
      } catch (error) {
        console.error("Sipariş bilgisi işlenirken hata:", error);
      }
    }
  }, [mounted]); // mounted değiştiğinde çalışsın
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (mounted && !authLoading) {
      if (!user) {
        console.log("Kullanıcı giriş yapmamış, login sayfasına yönlendiriliyor");
        const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        const redirectPath = `/login?redirect=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectPath;
      } else {
        console.log("Giriş yapılmış kullanıcı:", user);
      }
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
  
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-8 text-center border-b">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <FaCheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Siparişiniz Başarıyla Oluşturuldu!</h1>
          <p className="text-lg text-gray-600 mb-2">
            Siparişiniz başarıyla alındı ve işleme konuldu.
          </p>
          <p className="text-gray-600 mb-4">
            Sipariş numaranız: <span className="font-semibold">#{orderInfo.id }</span>
          </p>
          <div className="inline-block bg-green-50 rounded-md px-4 py-2 text-green-700 text-lg font-semibold">
            {orderInfo.total.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            })}
          </div>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-4">Ödeme Bilgileri</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Banka Havalesi / EFT</h3>
            <p className="text-gray-600 mb-4">
              Lütfen aşağıdaki banka hesabına sipariş tutarını, sipariş numaranızı açıklamada belirterek gönderiniz:
            </p>
            
            <div className="border border-gray-200 rounded-md p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Banka Adı:</p>
                  <p className="font-medium">Enpara</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Şube:</p>
                  <p className="font-medium">Çekmeköy Şubesi (0070)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Hesap Sahibi:</p>
                  <p className="font-medium">Ramazan Deniz Sağ</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">IBAN:</p>
                  <div className="flex flex-col gap-2">
                    <div className="bg-gray-50 rounded-md p-2">
                      <p className="font-medium text-sm select-all break-all">TR72 0011 1000 0000 0070 5463 42</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard('TR72 0011 1000 0000 0070 5463 42')}
                      className="text-xs py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors flex items-center justify-center w-full"
                      title="IBAN'ı Kopyala"
                    >
                      {copyingIban ? (
                        <>
                          <FaCheck className="h-3 w-3 mr-1 text-green-600" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <FaCopy className="h-3 w-3 mr-1" />
                          <span>Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
              <p className="text-sm">
                <strong>Önemli:</strong> Ödeme yaparken açıklama kısmına sipariş numaranızı (#
                {orderInfo.id}) yazmayı unutmayınız. Ödemeniz onaylandıktan sonra siparişiniz hazırlanacaktır.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-600">
            <p>
              Siparişinizle ilgili güncellemeler size e-posta yoluyla gönderilecektir.
              Herhangi bir sorunuz olursa lütfen bizimle <Link href="/iletisim" className="text-orange-500 hover:text-orange-600">iletişime geçin</Link>.
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <FaHome className="mr-2" />
            Ana Sayfaya Dön
          </Link>
          
          <Link href={`/siparisler/${orderInfo.id}`} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <FaBoxOpen className="mr-2" />
            Sipariş Detayları
          </Link>
        </div>
      </div>
    </div>
  );
} 