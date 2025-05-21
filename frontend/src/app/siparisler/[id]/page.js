"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaShoppingBag, FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaTag, FaMoneyBillAlt, FaExclamationTriangle, FaTrash, FaLiraSign, FaCalendarAlt, FaShippingFast, FaBarcode, FaClock, FaCopy, FaCheck } from 'react-icons/fa';
import Loader from '../../components/Loader';
import { OrderService, api } from '@/services';

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams.id || params.id; // useParams ile almaya çalış, yoksa params'tan al
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [payment, setPayment] = useState(null);
  const [copying, setCopying] = useState(false);
  
  // Client-side rendering için
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      toast.error('Sipariş detaylarını görüntülemek için giriş yapmalısınız');
      router.push(`/login?redirect=siparisler/${id}`);
    }
  }, [mounted, authLoading, user, router, id]);
  
  // Sipariş detaylarını yükleme fonksiyonunu component scope'una taşıyalım
  const fetchOrder = async () => {
    if (!user || !id) return;
    
    try {
      setLoading(true);
      
      // OrderService kullanarak sipariş detayını al
      const data = await OrderService.getOrderDetail(id);
      setOrder(data);
      console.log("Sipariş verileri:", data);
      
      // API'den gelen payment_info'yu kullan
      if (data.payment_info) {
        console.log("API'den ödeme bilgileri alındı:", data.payment_info);
        setPayment({
          id: data.payment_info.id,
          order: parseInt(id),
          payment_method: data.payment_info.method,
          status: data.payment_info.status,
          amount: data.payment_info.amount,
          transaction_id: data.payment_info.transaction_id,
          payment_date: data.payment_info.date
        });
      } else {
        // API'den ödeme bilgisi gelmiyorsa veya geçersizse, ödeme bilgilerini almaya çalış
        try {
          // api servisi üzerinden ödeme bilgilerini al
          const paymentData = await api.get('payments/');
          console.log("Tüm ödemeler:", paymentData);
          
          // Sipariş ID'sine göre filtreleme yapıyoruz
          const orderPayments = paymentData.results ? 
            paymentData.results.filter(p => p.order === parseInt(id)) : [];
          
          console.log("Bu siparişe ait ödemeler:", orderPayments);
          
          if (orderPayments.length > 0) {
            setPayment(orderPayments[0]);
            console.log("Ödeme verisi ayarlandı:", orderPayments[0]);
          } else {
            console.log("Bu siparişe ait ödeme bulunamadı");
            
            // Ödeme bulunamadıysa, manuel olarak bir ödeme nesnesi oluşturalım
            // Bu özellikle test amaçlıdır, gerçek bir uygulama senaryosunda API'den dönüş beklenmelidir
            setPayment({
              id: 999,
              order: parseInt(id),
              payment_method: 'bank_transfer',
              status: 'pending',
              amount: order?.final_price || 0 // Null kontrolü ekledik
            });
            console.log("Test için ödeme verisi oluşturuldu");
          }
        } catch (paymentError) {
          console.error('Ödeme bilgileri alınamadı:', paymentError);
          
          // Hata durumunda test amaçlı ödeme verisi
          setPayment({
            id: 999,
            order: parseInt(id),
            payment_method: 'bank_transfer',
            status: 'pending',
            amount: order?.final_price || 0 // Null kontrolü ekledik
          });
          console.log("Hata durumunda test için ödeme verisi oluşturuldu");
        }
      }
    } catch (error) {
      console.error('Sipariş yüklenirken hata:', error);
      
      if (error.status === 404) {
        toast.error('Sipariş bulunamadı');
        router.push('/siparisler');
      } else {
        toast.error('Sipariş detayları yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Sipariş detaylarını yükle
  useEffect(() => {
    if (mounted && user && id) {
      fetchOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user, id, router]);

  // Sipariş iptal etme fonksiyonu
  const handleCancelOrder = async () => {
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setCancelLoading(true);
      
      // OrderService kullanarak siparişi iptal et
      const data = await OrderService.cancelOrder(id, 'Müşteri tarafından iptal edildi');
      console.log("İptal yanıtı:", data);
      toast.success('Siparişiniz başarıyla iptal edildi');
      
      // İptal sonrası güncel sipariş detaylarını al
      try {
        // Sipariş bilgilerini tekrar çekelim
        const updatedOrder = await OrderService.getOrderDetail(id);
        console.log("İptal sonrası güncel sipariş:", updatedOrder);
        setOrder(updatedOrder);
        
        // Ödeme bilgisini güncelle
        if (updatedOrder.payment_info) {
          setPayment({
            id: updatedOrder.payment_info.id,
            order: parseInt(id),
            payment_method: updatedOrder.payment_info.method,
            status: updatedOrder.payment_info.status,
            amount: updatedOrder.payment_info.amount,
            transaction_id: updatedOrder.payment_info.transaction_id,
            payment_date: updatedOrder.payment_info.date
          });
        }
      } catch (error) {
        console.error("İptal sonrası sipariş bilgilerini güncellerken hata:", error);
        
        // API'den tam veri alınamadıysa, dönen veriyi kullanmaya çalışalım
        console.warn("İptal sonrası sipariş detayları yüklenemedi, dönen veriyi kullanıyoruz");
        
        // Yanıt formatlara göre uygun şekilde işle
        if (data.order) {
          // API'nin {order: {...}} şeklinde döndüğü format
          setOrder(data.order);
          
          // Ödeme bilgisini güncelle
          if (data.order.payment_info) {
            setPayment({
              id: data.order.payment_info.id,
              order: parseInt(id),
              payment_method: data.order.payment_info.method,
              status: data.order.payment_info.status,
              amount: data.order.payment_info.amount,
              transaction_id: data.order.payment_info.transaction_id,
              payment_date: data.order.payment_info.date
            });
          }
        } else {
          // API'nin doğrudan sipariş nesnesi döndüğü format
          setOrder(data);
          
          // Ödeme bilgisini güncelle
          if (data.payment_info) {
            setPayment({
              id: data.payment_info.id,
              order: parseInt(id),
              payment_method: data.payment_info.method,
              status: data.payment_info.status,
              amount: data.payment_info.amount,
              transaction_id: data.payment_info.transaction_id,
              payment_date: data.payment_info.date
            });
          }
        }
      }
    } catch (error) {
      console.error('Sipariş iptal edilirken hata:', error);
      
      let errorMessage = 'Sipariş iptal edilirken bir hata oluştu';
      if (error.data && error.data.error) {
        errorMessage = error.data.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };
  
  // Sipariş durumuna göre ikon ve renk belirle
  const getStatusInfo = (status) => {
    switch (status) {
      case 'created':
        return { icon: <FaShoppingBag />, color: 'orange', text: 'Oluşturuldu' };
      case 'paid':
        return { icon: <FaBoxOpen />, color: 'blue', text: 'Ödendi' };
      case 'shipped':
        return { icon: <FaTruck />, color: 'purple', text: 'Kargoya Verildi' };
      case 'delivered':
        return { icon: <FaCheckCircle />, color: 'green', text: 'Teslim Edildi' };
      case 'cancelled':
        return { icon: <FaTimesCircle />, color: 'red', text: 'İptal Edildi' };
      default:
        return { icon: <FaShoppingBag />, color: 'gray', text: 'Bilinmiyor' };
    }
  };
  
  // Ödeme yöntemi ve durumuna göre metinleri belirle
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'credit_card': return 'Kredi Kartı';
      case 'bank_transfer': return 'Banka Havalesi / EFT';
      case 'cash_on_delivery': return 'Kapıda Ödeme';
      default: return 'Belirtilmemiş';
    }
  };
  
  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          text: 'Beklemede', 
          color: 'yellow', 
          icon: <FaExclamationTriangle className="mr-1" /> 
        };
      case 'processing':
        return { 
          text: 'İşleniyor', 
          color: 'blue', 
          icon: <FaShoppingBag className="mr-1" /> 
        };
      case 'completed':
        return { 
          text: 'Tamamlandı', 
          color: 'green', 
          icon: <FaCheckCircle className="mr-1" /> 
        };
      case 'failed':
        return { 
          text: 'Başarısız', 
          color: 'red', 
          icon: <FaTimesCircle className="mr-1" /> 
        };
      case 'refunded':
        return { 
          text: 'İade Edildi', 
          color: 'purple', 
          icon: <FaMoneyBillAlt className="mr-1" /> 
        };
      default:
        return { 
          text: 'Beklemede', 
          color: 'yellow', 
          icon: <FaExclamationTriangle className="mr-1" /> 
        };
    }
  };
  
  // Sipariş detay sayfasında özelleştirilmiş kapıda ödeme mesajı
  const getPaymentMessage = (payment) => {
    if (!payment) return null;
    
    if (payment.payment_method === 'cash_on_delivery') {
      return (
        <div className="bg-green-50 border border-green-100 rounded p-3 mb-2 text-sm text-green-800">
          <div className="flex items-center font-medium mb-1">
            <FaCheckCircle className="mr-2" /> Kapıda Ödeme
          </div>
          <p>Bu sipariş kapıda ödeme olarak oluşturulmuştur. Kurye siparişi getirdiğinde ödemenizi yapabilirsiniz.</p>
        </div>
      );
    }
    
    if (payment.payment_method === 'credit_card' && payment.status === 'completed') {
      return (
        <div className="bg-green-50 border border-green-100 rounded p-3 mb-2 text-sm text-green-800">
          <div className="flex items-center font-medium mb-1">
            <FaCheckCircle className="mr-2" /> Ödeme Tamamlandı
          </div>
          <p>Kredi kartı ödemesi başarıyla tamamlanmıştır. Siparişiniz hazırlanıyor.</p>
        </div>
      );
    }
    
    if (payment.payment_method === 'bank_transfer' && payment.status === 'pending') {
      return (
        <div className="bg-yellow-50 border border-yellow-100 rounded p-3 mb-2 text-sm text-yellow-800">
          <div className="flex items-center font-medium mb-1">
            <FaExclamationTriangle className="mr-2" /> Ödeme Bekleniyor
          </div>
          <p>Siparişinizin işleme alınması için ödemenin tamamlanması gerekmektedir.</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Kargo durum bilgisi için yeni metod ekliyoruz
  const getShipmentStatusInfo = (status) => {
    switch (status) {
      case 'preparing':
        return {
          icon: <FaBoxOpen className="mr-2 h-4 w-4" />,
          text: 'Hazırlanıyor',
          color: 'blue',
          description: 'Siparişiniz hazırlanıyor. Yakında kargoya verilecek.'
        };
      case 'shipped':
        return {
          icon: <FaTruck className="mr-2 h-4 w-4" />,
          text: 'Kargoya Verildi',
          color: 'orange',
          description: 'Siparişiniz kargoya verildi. Takip numarası ile paketinizi izleyebilirsiniz.'
        };
      case 'in_transit':
        return {
          icon: <FaShippingFast className="mr-2 h-4 w-4" />,
          text: 'Taşınıyor',
          color: 'purple',
          description: 'Siparişiniz taşınma aşamasında. Kargo firması paketinizi teslim adresine götürüyor.'
        };
      case 'out_for_delivery':
        return {
          icon: <FaTruck className="mr-2 h-4 w-4" />,
          text: 'Dağıtıma Çıktı',
          color: 'green',
          description: 'Siparişiniz bugün teslim edilmek üzere dağıtıma çıktı.'
        };
      case 'delivered':
        return {
          icon: <FaCheckCircle className="mr-2 h-4 w-4" />,
          text: 'Teslim Edildi',
          color: 'green',
          description: 'Siparişiniz teslim edildi. Ürünlerimizi beğendiğinizi umuyoruz!'
        };
      case 'failed':
        return {
          icon: <FaTimesCircle className="mr-2 h-4 w-4" />,
          text: 'Teslimat Başarısız',
          color: 'red',
          description: 'Teslimat başarısız oldu. Lütfen adres bilgilerinizi kontrol edin.'
        };
      case 'returned':
        return {
          icon: <FaTimesCircle className="mr-2 h-4 w-4" />,
          text: 'İade Edildi',
          color: 'red',
          description: 'Siparişiniz iade edildi.'
        };
      default:
        return {
          icon: <FaBoxOpen className="mr-2 h-4 w-4" />,
          text: 'Bilinmiyor',
          color: 'gray',
          description: 'Kargo durumu hakkında bilgi bulunmuyor.'
        };
    }
  };
  
  // Kopyalama işlevi
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(true);
      toast.success('Takip numarası kopyalandı');
      
      // 2 saniye sonra kopyalama durumunu sıfırla
      setTimeout(() => {
        setCopying(false);
      }, 2000);
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
      toast.error('Kopyalama başarısız oldu');
    }
  };
  
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 sm:py-16">
        <Loader size="large" />
      </div>
    );
  }
  
  if (!user) {
    return null; // Kullanıcı yoksa hiçbir şey gösterme (zaten yönlendirilecek)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 sm:py-16">
        <Loader size="large" />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="py-8 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
          <p className="text-gray-600">Sipariş bulunamadı.</p>
          <Link href="/siparisler" className="mt-4 inline-block text-orange-500 hover:text-orange-600">
            Tüm Siparişlere Dön
          </Link>
        </div>
      </div>
    );
  }
  
  const statusInfo = getStatusInfo(order.status);
  console.log("Render öncesi payment durumu:", payment);

  // Sipariş iptal edilebilir mi? (kargoya verilmemiş ve teslim edilmemiş olmalı)
  const canBeCancelled = order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled';
  
  return (
    <div className="py-8 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/siparilser" className="inline-flex items-center text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
          <FaArrowLeft className="mr-2" />
          Siparişlerime Dön
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
        {/* Sipariş Başlığı ve Durum */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Sipariş #{order.id + 91185}</h1>
              <div className="flex items-center mb-2 sm:mb-3">
                <div className={`text-${statusInfo.color}-500 mr-2`}>
                  {statusInfo.icon}
                </div>
                <span className="font-medium text-sm bg-gray-100 text-gray-800 py-1 px-3 rounded-full">
                  {order.formatted_status || statusInfo.text}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Sipariş Tarihi: <span className="font-medium">{order.formatted_created_at}</span>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end">
              <div className="text-sm text-gray-500 mb-1">Sipariş Toplamı:</div>
              <div className="font-bold text-2xl text-gray-800 flex items-center">
                <FaLiraSign className="h-4 w-4 mr-1" />
                {order.final_price?.toLocaleString('tr-TR')}
              </div>

              {/* Sipariş iptal butonu */}
              {canBeCancelled && (
                <button 
                  onClick={handleCancelOrder} 
                  disabled={cancelLoading}
                  className="mt-4 flex items-center justify-center text-sm px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  {cancelLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      İşleniyor...
                    </span>
                  ) : (
                    <>
                      <FaTrash className="mr-2 h-4 w-4" /> 
                      Siparişi İptal Et
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Sipariş Öğeleri - Masaüstü Görünümü */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sipariş Öğeleri</h2>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border-separate" style={{ borderSpacing: '0 0.5rem' }}>
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İndirim
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adet
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item) => {
                  const hasDiscount = item.product_detail?.active_discount !== null && item.product_detail?.active_discount !== undefined;
                  const originalPrice = item.price;
                  const currentPrice = hasDiscount && item.product_detail?.discounted_price !== null ? 
                    item.product_detail.discounted_price : item.price;
                  const discountAmount = hasDiscount ? originalPrice - currentPrice : 0;
                  const discountPercentage = hasDiscount && item.product_detail?.active_discount?.discount_percentage ?
                    parseFloat(item.product_detail.active_discount.discount_percentage) :
                    Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                  
                  return (
                  <tr key={item.id} className="hover:bg-gray-50 rounded-lg">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-14 w-14 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                          {/* Resim olup olmadığını kontrol ederken, null veya undefined kontrolü yapıyoruz */}
                          {item.product_detail && item.product_detail.img_url ? (
                           
                            <Image src={item.product_detail.img_url} alt={item.product_detail.name} width={64} height={64} className="w-full h-full object-cover rounded" />
                          
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <FaShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-800">
                            {item.product_detail?.name || 'Ürün'}
                          </div>
                          {item.product_detail?.weight && (
                            <div className="text-xs text-gray-500">
                              {item.product_detail.weight >= 1000 
                                ? `${(item.product_detail.weight / 1000).toLocaleString('tr-TR')} kg`
                                : `${item.product_detail.weight.toLocaleString('tr-TR')} g`}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      <div className="flex items-center justify-end">
                        <FaLiraSign className="h-3 w-3 mr-1" />
                        {originalPrice?.toLocaleString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {hasDiscount ? (
                        <div>
                          <span className="text-red-600 font-medium text-sm">%{discountPercentage}</span>
                          <div className="text-green-600 text-xs flex items-center justify-center">
                            <FaLiraSign className="h-2.5 w-2.5 mr-0.5" />
                            {discountAmount?.toLocaleString('tr-TR')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end text-gray-800">
                        <FaLiraSign className="h-3 w-3 mr-1" />
                        {(currentPrice * item.quantity)?.toLocaleString('tr-TR')}
                      </div>
                      {hasDiscount && (
                        <div className="text-xs text-gray-500 line-through flex items-center justify-end">
                          <FaLiraSign className="h-2.5 w-2.5 mr-0.5" />
                          {(originalPrice * item.quantity)?.toLocaleString('tr-TR')}
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Sipariş Öğeleri - Mobil Görünümü */}
          <div className="md:hidden space-y-4">
            {order.items?.map((item) => {
              const hasDiscount = item.product_detail?.active_discount !== null && item.product_detail?.active_discount !== undefined;
              const originalPrice = item.price;
              const currentPrice = hasDiscount && item.product_detail?.discounted_price !== null ? 
                item.product_detail.discounted_price : item.price;
              const discountAmount = hasDiscount ? originalPrice - currentPrice : 0;
              const discountPercentage = hasDiscount && item.product_detail?.active_discount?.discount_percentage ?
                parseFloat(item.product_detail.active_discount.discount_percentage) :
                Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
              
              return (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex mb-3">
                    <div className="h-16 w-16 flex-shrink-0 relative rounded-lg overflow-hidden bg-white">
                      {/* Resim olup olmadığını kontrol ederken, null veya undefined kontrolü yapıyoruz */}
                      {item.product_detail && item.product_detail.img_url ? (
                        <img
                          src={item.product_detail.img_url || '/images/default-product.jpg'}
                          alt={item.product_detail.name || 'Ürün Görseli'}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/200x200?text=Ürün+Görseli';
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <FaShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium text-gray-800 text-sm mb-1">
                        {item.product_detail?.name || 'Ürün'}
                      </div>
                      {item.product_detail?.weight && (
                        <div className="text-xs text-gray-500 mb-1">
                          {item.product_detail.weight >= 1000 
                            ? `${(item.product_detail.weight / 1000).toLocaleString('tr-TR')} kg`
                            : `${item.product_detail.weight.toLocaleString('tr-TR')} g`}
                        </div>
                      )}
                      <div className="flex items-center text-xs text-gray-600">
                        <span className="mr-3 flex items-center">
                          <FaLiraSign className="h-2.5 w-2.5 mr-0.5" />
                          {originalPrice?.toLocaleString('tr-TR')}
                        </span>
                        <span>Adet: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    {hasDiscount && (
                      <div className="text-xs text-green-600">
                        <span className="text-red-600 font-medium">%{discountPercentage}</span> indirim (
                        <span className="flex items-center inline-flex">
                          <FaLiraSign className="h-2.5 w-2.5 mr-0.5" />
                          {discountAmount?.toLocaleString('tr-TR')}
                        </span>)
                      </div>
                    )}
                    <div className="font-medium text-gray-800 text-sm flex items-center">
                      <span className="text-xs text-gray-500 mr-1">Toplam:</span>
                      <FaLiraSign className="h-3 w-3 mr-0.5" />
                      {(currentPrice * item.quantity)?.toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Teslimat Adresi */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Teslimat Adresi</h2>
              <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className="bg-orange-100 text-orange-500 p-2 rounded-lg mr-3">
                    <FaMapMarkerAlt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-800">{order.first_name} {order.last_name}</div>
                    <div className="text-sm text-gray-600 mt-1">{order.address}</div>
                    <div className="text-sm text-gray-600">{order.postal_code && `${order.postal_code}, `}{order.city}</div>
                    <div className="text-sm text-gray-600">{order.country}</div>
                    <div className="text-sm text-gray-600 mt-1">{order.phone_number}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Kargo Takip Bilgileri */}
            {order.shipment_tracking_info && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Kargo Takip Bilgileri</h2>
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
                  {/* Kargo Durumu */}
                  <div className="mb-4">
                    {(() => {
                      const statusInfo = getShipmentStatusInfo(order.shipment_tracking_info.status);
                      let borderColorClass = '';
                      let bgColorClass = '';
                      let textColorClass = '';
                      
                      if (statusInfo.color === 'blue') {
                        borderColorClass = 'border-blue-500';
                        bgColorClass = 'bg-blue-50';
                        textColorClass = 'text-blue-700';
                      } else if (statusInfo.color === 'orange') {
                        borderColorClass = 'border-orange-500';
                        bgColorClass = 'bg-orange-50';
                        textColorClass = 'text-orange-700';
                      } else if (statusInfo.color === 'green') {
                        borderColorClass = 'border-green-500';
                        bgColorClass = 'bg-green-50';
                        textColorClass = 'text-green-700';
                      } else if (statusInfo.color === 'red') {
                        borderColorClass = 'border-red-500';
                        bgColorClass = 'bg-red-50';
                        textColorClass = 'text-red-700';
                      } else if (statusInfo.color === 'purple') {
                        borderColorClass = 'border-purple-500';
                        bgColorClass = 'bg-purple-50';
                        textColorClass = 'text-purple-700';
                      } else {
                        borderColorClass = 'border-gray-500';
                        bgColorClass = 'bg-gray-50';
                        textColorClass = 'text-gray-700';
                      }
                      
                      return (
                        <div className={`p-4 border-l-4 ${borderColorClass} ${bgColorClass} rounded-lg`}>
                          <div className={`flex items-center ${textColorClass} font-medium text-sm mb-1`}>
                            {statusInfo.icon}
                            {order.shipment_tracking_info.status_text || statusInfo.text}
                          </div>
                          <p className="text-sm text-gray-600">{order.shipment_tracking_info.status_description || statusInfo.description}</p>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Kargo Firması */}
                    <div className="flex items-start">
                      <div className="bg-gray-200 text-gray-600 p-1.5 rounded-md mr-3">
                        <FaShippingFast className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Kargo Firması</div>
                        <div className="font-medium text-sm text-gray-800">{order.shipment_tracking_info.shipping_company}</div>
                      </div>
                    </div>
                    
                    {/* Takip Numarası */}
                    {order.shipment_tracking_info.tracking_number && order.shipment_tracking_info.tracking_number !== "Henüz atanmadı" && (
                      <div className="flex items-start">
                        <div className="bg-gray-200 text-gray-600 p-1.5 rounded-md mr-3">
                          <FaBarcode className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">Takip Numarası</div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="font-medium text-sm text-gray-800 mb-2 sm:mb-0 sm:mr-2">{order.shipment_tracking_info.tracking_number}</div>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                              <button
                                onClick={() => copyToClipboard(order.shipment_tracking_info.tracking_number)}
                                className="text-xs py-1 px-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors flex items-center justify-center"
                                title="Numarayı Kopyala"
                              >
                                {copying ? (
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
                              {order.shipment_tracking_info.tracking_url && (
                                <Link 
                                  href={order.shipment_tracking_info.tracking_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs py-1 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center justify-center"
                                >
                                  Takip Et
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Kargoya Veriliş Tarihi */}
                      {order.shipment_tracking_info.shipped_date && (
                        <div className="flex items-start">
                          <div className="bg-gray-200 text-gray-600 p-1.5 rounded-md mr-3">
                            <FaCalendarAlt className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Kargoya Veriliş</div>
                            <div className="font-medium text-sm text-gray-800">{order.shipment_tracking_info.shipped_date}</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Tahmini Teslimat Tarihi */}
                      {order.shipment_tracking_info.estimated_delivery && (
                        <div className="flex items-start">
                          <div className="bg-gray-200 text-gray-600 p-1.5 rounded-md mr-3">
                            <FaClock className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Tahmini Teslimat</div>
                            <div className="font-medium text-sm text-gray-800">{order.shipment_tracking_info.estimated_delivery}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Teslim Tarihi */}
                    {order.shipment_tracking_info.delivered_date && (
                      <div className="flex items-start">
                        <div className="bg-green-100 text-green-600 p-1.5 rounded-md mr-3">
                          <FaCheckCircle className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Teslim Tarihi</div>
                          <div className="font-medium text-sm text-gray-800">{order.shipment_tracking_info.delivered_date}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Sipariş Notu */}
            {order.notes && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Sipariş Notu</h2>
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              </div>
            )}
            
            {/* Ödeme Bilgileri */}
            {payment && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Ödeme Bilgileri</h2>
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Ödeme Yöntemi</div>
                      <div className="font-medium text-sm text-gray-800">{getPaymentMethodText(payment.payment_method)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Durum</div>
                      <div className={`font-medium text-sm flex items-center ${
                        getPaymentStatusInfo(payment.status).color === 'yellow' ? 'text-yellow-600' : 
                        getPaymentStatusInfo(payment.status).color === 'green' ? 'text-green-600' : 
                        getPaymentStatusInfo(payment.status).color === 'red' ? 'text-red-600' : 
                        getPaymentStatusInfo(payment.status).color === 'blue' ? 'text-blue-600' : 
                        getPaymentStatusInfo(payment.status).color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        {getPaymentStatusInfo(payment.status).icon}
                        {getPaymentStatusInfo(payment.status).text}
                      </div>
                    </div>
                  </div>
                  
                  {/* Özel ödeme mesajları */}
                  {getPaymentMessage(payment)}
                  
                  {/* Banka Havalesi Bilgileri */}
                  {payment.payment_method === 'bank_transfer' && payment.status === 'pending' && (
                    <div className="mt-3 bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-800 mb-2">Banka Hesap Bilgileri</div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Banka:</span>
                          <span className="font-medium text-gray-800">Enpara</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Hesap Sahibi:</span>
                          <span className="font-medium text-gray-800">Ramazan Deniz Sağ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">IBAN:</span>
                          <span className="font-medium text-xs select-all break-all">TR72 0011 1000 0000 0070 5463 42</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Açıklama:</span>
                          <span className="font-medium text-gray-800">Sipariş #{order.id + 91185}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Fiyat Özeti */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Ödeme Özeti</h2>
            <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium text-gray-800 flex items-center">
                    <FaLiraSign className="h-3 w-3 mr-0.5" />
                    {order.total_price?.toLocaleString('tr-TR')}
                  </span>
                </div>
                
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center text-green-600">
                      <FaTag className="mr-1 h-3 w-3" />
                      İndirim {order.coupon_detail && `(${order.coupon_detail.code})`}
                    </span>
                    <span className="text-green-600 flex items-center">
                      -<FaLiraSign className="h-3 w-3 mx-0.5" />
                      {order.discount?.toLocaleString('tr-TR')}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  {order.shipping_cost && order.shipping_cost > 0 ? (
                    <span className="font-medium text-gray-800 flex items-center">
                      <FaLiraSign className="h-3 w-3 mr-0.5" />
                      {order.shipping_cost.toLocaleString('tr-TR')}
                    </span>
                  ) : (
                    <span className="text-green-600">Ücretsiz</span>
                  )}
                </div>
                
                {/* Kapıda Ödeme Ücreti */}
                {order.payment_method === 'cash_on_delivery' && order.cod_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kapıda Ödeme Ücreti</span>
                    <span className="font-medium text-gray-800 flex items-center">
                      <FaLiraSign className="h-3 w-3 mr-0.5" />
                      {order.cod_fee.toLocaleString('tr-TR')}
                    </span>
                  </div>
                )}
                
                <div className="pt-3 mt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">Toplam</span>
                    <span className="font-bold text-xl text-gray-800 flex items-center">
                      <FaLiraSign className="h-4 w-4 mr-0.5" />
                      {order.final_price?.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* İlerleme Çubuğu */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Sipariş Durumu</h2>
              <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                  <div className="overflow-hidden h-2 mb-6 flex rounded bg-gray-200">
                    {/* İlerleme çubuğu - sipariş durumuna göre doldurulan kısım */}
                    <div
                      style={{
                        width:
                          order.status === 'created'
                            ? '25%'
                            : order.status === 'paid'
                            ? '50%'
                            : order.status === 'shipped'
                            ? '75%'
                            : order.status === 'delivered'
                            ? '100%'
                            : order.status === 'cancelled'
                            ? '0%'  // İptal edilmiş siparişler
                            : '0%'
                      }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        order.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                    ></div>
                  </div>
                  
                  {/* Masaüstü görünümü */}
                  <div className="hidden sm:grid sm:grid-cols-4 text-xs text-gray-600">
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mb-1 ${
                        ['created', 'paid', 'shipped', 'delivered'].includes(order.status) ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FaShoppingBag className="h-3 w-3" />
                      </div>
                      <span>Oluşturuldu</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mb-1 ${
                        ['paid', 'shipped', 'delivered'].includes(order.status) ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FaBoxOpen className="h-3 w-3" />
                      </div>
                      <span>Hazırlanıyor</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mb-1 ${
                        ['shipped', 'delivered'].includes(order.status) ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FaTruck className="h-3 w-3" />
                      </div>
                      <span>Kargoda</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mb-1 ${
                        order.status === 'delivered' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FaCheckCircle className="h-3 w-3" />
                      </div>
                      <span>Teslim Edildi</span>
                    </div>
                  </div>
                  
                  {/* Mobil görünümü - yatay kaymayı önlemek için dikey düzenleme */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        ['created', 'paid', 'shipped', 'delivered'].includes(order.status) ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FaShoppingBag className="h-3 w-3" />
                      </div>
                      <span className="ml-3 text-sm">Oluşturuldu</span>
                      {['created', 'paid', 'shipped', 'delivered'].includes(order.status) && 
                        <div className="ml-auto text-orange-500">
                          <FaCheckCircle className="h-4 w-4" />
                        </div>
                      }
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        ['paid', 'shipped', 'delivered'].includes(order.status) ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FaBoxOpen className="h-3 w-3" />
                      </div>
                      <span className="ml-3 text-sm">Hazırlanıyor</span>
                      {['paid', 'shipped', 'delivered'].includes(order.status) && 
                        <div className="ml-auto text-orange-500">
                          <FaCheckCircle className="h-4 w-4" />
                        </div>
                      }
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        ['shipped', 'delivered'].includes(order.status) ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FaTruck className="h-3 w-3" />
                      </div>
                      <span className="ml-3 text-sm">Kargoda</span>
                      {['shipped', 'delivered'].includes(order.status) && 
                        <div className="ml-auto text-orange-500">
                          <FaCheckCircle className="h-4 w-4" />
                        </div>
                      }
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        order.status === 'delivered' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FaCheckCircle className="h-3 w-3" />
                      </div>
                      <span className="ml-3 text-sm">Teslim Edildi</span>
                      {order.status === 'delivered' && 
                        <div className="ml-auto text-orange-500">
                          <FaCheckCircle className="h-4 w-4" />
                        </div>
                      }
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 