"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FaShoppingBag, FaChevronRight, FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaTrash, FaShippingFast, FaBarcode } from 'react-icons/fa';
import Loader from '../components/Loader';
import { OrderService } from '@/services';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState({});
  const [mounted, setMounted] = useState(false);
  
  // Client-side rendering için
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      toast.error('Siparişlerinizi görüntülemek için giriş yapmalısınız');
      router.push('/login?redirect=orders');
    }
  }, [mounted, authLoading, user, router]);
  
  // Siparişleri yükle
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // OrderService'i kullanarak siparişleri getir
        const ordersData = await OrderService.getOrders();
        setOrders(ordersData.results || []);
      } catch (error) {
        console.error('Siparişler yüklenirken hata:', error);
        toast.error('Siparişleriniz yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    if (mounted && user) {
      fetchOrders();
    }
  }, [mounted, user]);
  const handleRefund = (order) => {
    if (typeof window === 'undefined') return;
  
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "refund",
      ecommerce: {
        transaction_id: order.id.toString(),
        value: order.final_price,
        currency: "TRY",
        items: order.items.map((item) => ({
          item_id: item.product_detail?.id?.toString() || item.id.toString(),
          item_name: item.product_detail?.name || 'Ürün',
          quantity: item.quantity,
          price: item.price,
        })),
      },
    });
  
    console.log("Refund event gönderildi:", order.id);
  };
  // Sipariş iptal etme fonksiyonu
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setCancelLoading(prev => ({ ...prev, [orderId]: true }));
      
      // OrderService ile sipariş iptal işlemi
      const responseData = await OrderService.cancelOrder(orderId, 'Müşteri isteği ile iptal edildi');
      
      // Başarılı cevaptan başarı mesajını göster
      toast.success(responseData.success || 'Siparişiniz başarıyla iptal edildi');
      
      // Siparişleri güncelle (api'den dönen veriden al)
      if (responseData.order) {
        if (responseData.order.status === 'returned' && responseData.order.delivered_at) {
          handleRefund(responseData.order); // 🚨 Burada iade event'ini tetikliyoruz
        }
        setOrders(orders.map(order => 
          order.id === orderId ? { 
            ...order, 
            ...responseData.order,
            formatted_status: 'İptal Edildi'  // Frontend gösterimi için
          } : order
        ));
      } else {
        // API'den dönüş yoksa sadece durum güncellenir
        setOrders(orders.map(order => 
          order.id === orderId ? { 
            ...order, 
            status: 'cancelled', 
            formatted_status: 'İptal Edildi' 
          } : order
        ));
      }
    } catch (error) {
      console.error('Sipariş iptal edilirken hata:', error);
      
      // Hata mesajını göster
      let errorMessage = 'Sipariş iptal edilirken bir hata oluştu';
      if (error.data && error.data.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setCancelLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };
  
  // Sipariş durumuna göre ikon ve renk belirle
  const getStatusIcon = (status) => {
    switch (status) {
      case 'created':
        return <FaShoppingBag className="text-orange-500" />;
      case 'paid':
        return <FaBoxOpen className="text-blue-500" />;
      case 'shipped':
        return <FaTruck className="text-purple-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaShoppingBag className="text-gray-500" />;
    }
  };

  // Kargo durumunu görsel olarak göster
  const ShipmentStatusBadge = ({ shipmentInfo }) => {
    if (!shipmentInfo) return null;
    
    let bgColor = "";
    let textColor = "";
    let icon = null;
    
    switch (shipmentInfo.status) {
      case 'preparing':
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        icon = <FaBoxOpen className="mr-1 h-3 w-3" />;
        break;
      case 'shipped':
        bgColor = "bg-orange-100";
        textColor = "text-orange-800";
        icon = <FaTruck className="mr-1 h-3 w-3" />;
        break;
      case 'in_transit':
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        icon = <FaShippingFast className="mr-1 h-3 w-3" />;
        break;
      case 'out_for_delivery':
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        icon = <FaTruck className="mr-1 h-3 w-3" />;
        break;
      case 'delivered':
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        icon = <FaCheckCircle className="mr-1 h-3 w-3" />;
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
        icon = <FaBoxOpen className="mr-1 h-3 w-3" />;
    }
    
    return (
      <div className={`flex items-center text-xs ${bgColor} ${textColor} rounded px-2 py-1`}>
        {icon}
        <span>{shipmentInfo.status_text}</span>
      </div>
    );
  };

  // Sipariş iptal edilebilir mi? (kargoya verilmemiş ve teslim edilmemiş olmalı)
  const canBeCancelled = (status) => {
    return status !== 'shipped' && status !== 'delivered' && status !== 'cancelled';
  };
  
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <Loader size="large" />
      </div>
    );
  }
  
  if (!user) {
    return null; // Kullanıcı yoksa hiçbir şey gösterme (zaten yönlendirilecek)
  }
  
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Siparişlerim</h1>
        <Link href="/" className="text-orange-500 hover:text-orange-600 flex items-center">
          <FaArrowLeft className="mr-2" />
          Ana Sayfaya Dön
        </Link>
      </div>
      
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Siparişleriniz yükleniyor...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Image
            src="/images/empty-cart.svg"
            alt="Sipariş Bulunamadı"
            width={200}
            height={200}
            className="mx-auto mb-6"
          />
          <h2 className="text-xl font-semibold mb-4">Henüz siparişiniz bulunmuyor</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Görünüşe göre henüz bir sipariş vermediniz. Ürünlerimize göz atıp alışverişe başlayabilirsiniz.
          </p>
          <Link href="/urunler" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold transition-colors">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      {getStatusIcon(order.status)}
                      <span className="ml-2 font-semibold">{order.formatted_status}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Sipariş No: <span className="font-medium">#{order.id + 91185}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Tarih: <span className="font-medium">{order.formatted_created_at}</span>
                    </div>
                    {/* Kargo Bilgisi */}
                    {order.shipment_tracking_info && (
                      <div className="mt-2 flex items-center">
                        <ShipmentStatusBadge shipmentInfo={order.shipment_tracking_info} />
                        {order.shipment_tracking_info.tracking_number && 
                         order.shipment_tracking_info.tracking_number !== "Henüz atanmadı" && (
                          <div className="ml-2 text-xs text-gray-600 flex items-center">
                            <FaBarcode className="mr-1 h-3 w-3" />
                            {order.shipment_tracking_info.tracking_number}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex flex-col items-end">
                    <div className="font-medium text-lg">
                      {order.final_price.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.length} ürün
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Link href={`/siparisler/${order.id}`} className="text-orange-500 hover:text-orange-600 flex items-center text-sm">
                        Detayları Görüntüle
                        <FaChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                      {canBeCancelled(order.status) && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)} 
                          disabled={cancelLoading[order.id]}
                          className="text-red-500 hover:text-red-600 flex items-center text-sm ml-4"
                        >
                          {cancelLoading[order.id] ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              İşleniyor...
                            </span>
                          ) : (
                            <>
                              <FaTrash className="mr-1 h-3 w-3" />
                              İptal Et
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {order.items.slice(0, 4).map((item, index) => (
                    <div key={item.id} className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 relative rounded overflow-hidden bg-gray-200">
                        {item.product_detail?.img_url ? (
                          <Image
                            src={item.product_detail.img_url}
                            alt={item.product_detail.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <FaShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product_detail?.name || 'Ürün'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} adet
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {order.items.length > 4 && (
                    <div className="flex items-center justify-center text-gray-500">
                      <span>+{order.items.length - 4} diğer ürün</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 