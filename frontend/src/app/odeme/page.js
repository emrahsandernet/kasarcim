"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Loader from '@/components/Loader';
import { FaMoneyBillAlt, FaCreditCard, FaRegCreditCard, FaTruck, FaCheck } from 'react-icons/fa';
import { UserService, OrderService, CartService } from '@/services';

const PaymentPage = () => {
  const { user, authLoading, token } = useAuth();
  const { cartItems, cartTotal, discount, couponCode, discountedTotal, clearCart } = useCart();
  const router = useRouter();
  const formRef = useRef(null);
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [orderNotes, setOrderNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      toast.error('Lütfen önce giriş yapın');
      router.push('/login?returnUrl=/odeme');
    }
  }, [mounted, authLoading, user, router]);
  
  const shippingCost = cartTotal < 1500 ? 250 : 0;
  
  // Kapıda ödeme ücreti
  const cashOnDeliveryFee = paymentMethod === 'cash_on_delivery' ? 50 : 0;
  
  // Final toplam
  const finalTotal = discountedTotal + shippingCost + cashOnDeliveryFee;
  
  // Sepet boşsa ana sayfaya yönlendir
  useEffect(() => {
    if (mounted && cartItems.length === 0) {
      toast.error('Sepetiniz boş');
      router.push('/');
    }
  }, [mounted, cartItems, router]);
  
  // Adres listesini yükle
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      
      try {
        // UserService ile adresleri getir
        const addresses = await UserService.getAddresses();
        setAddresses(addresses);
        
        // Varsayılan adresi seç ya da ilk adresi seç
        const defaultAddress = addresses.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        } else if (addresses.length > 0) {
          setSelectedAddress(addresses[0].id);
        }
      } catch (error) {
        console.error('Adres yüklenirken hata:', error);
      }
    };
    
    if (mounted && user) {
      fetchAddresses();
    }
  }, [mounted, user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAddress) {
      toast.error('Lütfen bir adres seçin');
      return;
    }
    
    setProcessing(true);
    
    try {
      // 1. Sipariş oluştur
      const orderData = {
        address_id: selectedAddress,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        coupon_code: couponCode || null,
        payment_method: paymentMethod === 'cash_on_delivery' ? 'cash_on_delivery' : 'online',
        total_price: cartTotal,
        discount: discount,
        shipping_cost: shippingCost,
        final_price: finalTotal,
        notes: orderNotes
      };
      
      // OrderService ile sipariş oluştur
      const order = await OrderService.createOrder(orderData);
      
      // 2. Ödeme oluştur
      const paymentData = {
        order_id: order.id,
        payment_method: paymentMethod,
        amount: finalTotal
      };
      
      // CartService ile ödeme oturumu oluştur
      await CartService.createPaymentSession(paymentData);
      
      // Sepeti temizle
      clearCart();
      
      // Konsola debug bilgisi
      
      
      // Sipariş tamamlandı sayfasına yönlendir - doğrudan yönlendirme yapıyoruz
      const redirectUrl = `/siparis-basarili?orderId=${order.id}&total=${finalTotal}`;
      window.location.href = redirectUrl;
      
    } catch (error) {
      console.error('Ödeme hatası:', error);
      
      // Hata mesajı göster
      let errorMessage = 'Bir hata oluştu';
      if (error.data && error.data.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };
  
  // Form submit fonksiyonu
  const submitOrder = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };
  
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <Loader size="large" />
      </div>
    );
  }
  
  // Kullanıcı giriş yapmamışsa içeriği gösterme
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="text-center bg-orange-50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-orange-700 mb-3">Giriş Yapılması Gerekiyor</h2>
          <p className="text-gray-600 mb-6">Ödeme sayfasına erişmek için lütfen giriş yapın.</p>
          <Link 
            href="/giris?returnUrl=/odeme" 
            className="inline-block bg-orange-600 text-white font-medium px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
          >
            Giriş Sayfasına Git
          </Link>
        </div>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="text-center bg-orange-50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-orange-700 mb-3">Sepetiniz Boş</h2>
          <p className="text-gray-600 mb-6">Ödeme yapabilmek için sepetinize ürün ekleyin.</p>
          <Link 
            href="/urunler" 
            className="inline-block bg-orange-600 text-white font-medium px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
          >
            Ürünlere Göz At
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Ödeme</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sol taraf: Ödeme formu */}
        <div className="lg:w-2/3">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Teslimat Adresi */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Teslimat Adresi</h2>
              
              {addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Henüz kayıtlı adresiniz bulunmuyor.</p>
                  <Link href="/adreslerim?returnUrl=/odeme" className="text-orange-500 hover:text-orange-600 font-medium">
                    Yeni adres ekle
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {addresses.map(address => (
                    <div 
                      key={address.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-orange-300 hover:shadow-md ${selectedAddress === address.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{address.title}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {address.address}, {address.city} / {address.state} {address.postal_code}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{address.phone}</div>
                        </div>
                        {selectedAddress === address.id && (
                          <div className="bg-orange-500 text-white rounded-full p-1">
                            <FaCheck className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end mt-3">
                    <Link href="/adreslerim?returnUrl=/odeme" className="text-orange-500 hover:text-orange-600 text-sm flex items-center">
                      <span className="mr-1">+</span> Yeni adres ekle
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Ödeme Yöntemi */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Ödeme Yöntemi</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all relative ${paymentMethod === 'bank_transfer' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:shadow-md'}`}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-2">
                      <FaMoneyBillAlt className="text-orange-500 h-6 w-6" />
                    </div>
                  </div>
                  <div className="font-medium text-center">Banka Havalesi / EFT</div>
                </div>
                
                <div 
                  className="border rounded-lg p-4 cursor-not-allowed transition-all opacity-50 bg-gray-50"
                >
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-2">
                      <FaCreditCard className="text-orange-500 h-6 w-6" />
                    </div>
                  </div>
                  <div className="font-medium text-center">Kredi Kartı</div>
                  <div className="bg-gray-100 text-gray-700 text-xs rounded mt-2 p-1 text-center">
                    Çok yakında hizmetinizde...
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'cash_on_delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:shadow-md'}`}
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                >
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-2">
                      <FaTruck className="text-orange-500 h-6 w-6" />
                    </div>
                  </div>
                  <div className="font-medium text-center">Kapıda Ödeme</div>
                  {paymentMethod === 'cash_on_delivery' && (
                    <div className="bg-orange-100 text-orange-700 text-xs rounded mt-2 p-1 text-center">
                      +50 TL ücret uygulanır
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sipariş Notu */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Sipariş Notu</h2>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                placeholder="Siparişiniz için eklemek istediğiniz notlar..."
              ></textarea>
            </div>
          </form>
        </div>
        
        {/* Sağ taraf: Sipariş Özeti */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>
            
            {/* Ürünler */}
            <div className="divide-y mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="py-3 flex">
                  <div className="flex-shrink-0 w-16 h-16 mr-4">
                    <Image src={item.img_url} alt={item.name} width={64} height={64} className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.quantity} adet</p>
                    <p className="text-sm font-medium mt-1">
                      {item.currentPrice} TL
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Fiyat Özeti */}
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span>Ara Toplam</span>
                <span>{cartTotal.toFixed(2)} TL</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>İndirim</span>
                  <span>-{discount.toFixed(2)} TL</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Kargo</span>
                <span>{shippingCost === 0 ? 'Ücretsiz' : `${shippingCost.toFixed(2)} TL`}</span>
              </div>
              
              {paymentMethod === 'cash_on_delivery' && (
                <div className="flex justify-between">
                  <span>Kapıda Ödeme Ücreti</span>
                  <span>{cashOnDeliveryFee.toFixed(2)} TL</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Toplam</span>
                <span>{finalTotal.toFixed(2)} TL</span>
              </div>
            </div>
            
            {/* Siparişi Tamamla Butonu Buraya Taşındı */}
            <button
              type="button"
              onClick={submitOrder}
              disabled={processing || !selectedAddress}
              className="w-full py-3 px-4 bg-orange-600 text-white font-medium rounded-md shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </span>
              ) : (
                'Siparişi Tamamla'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 