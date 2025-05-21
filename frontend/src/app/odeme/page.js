"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Loader from '@/components/Loader';
import { FaMoneyBillAlt, FaCreditCard, FaRegCreditCard, FaTruck, FaCheck, FaFileAlt, FaFileContract } from 'react-icons/fa';
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
  const [agreeSalesContract, setAgreeSalesContract] = useState(false);
  const [agreeInfoForm, setAgreeInfoForm] = useState(false);
  const [showSalesContract, setShowSalesContract] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Custom scrollbar stil tanımı
  useEffect(() => {
    // Özel scrollbar stilini ekle
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #F97316;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #e45d03;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
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
  
  // Sipariş tamamlanabilir mi kontrolü
  const canCompleteOrder = selectedAddress && agreeSalesContract && agreeInfoForm && !processing;
  
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
  

  
  // Sözleşme modalları
  const SalesContractModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out">
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-15 backdrop-blur-[1px] transition-opacity duration-300"
        onClick={() => setShowSalesContract(false)}
      ></div>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] shadow-2xl relative z-10 transition-all duration-300 transform scale-100 opacity-100">
        <div className="sticky top-0 bg-white rounded-t-xl p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Mesafeli Satış Sözleşmesi</h3>
          <button 
            onClick={() => setShowSalesContract(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 140px)', scrollbarWidth: 'thin', scrollbarColor: '#F97316 #f1f1f1' }}>
          <h2 className="text-xl font-bold mb-4 text-gray-800">MADDE 1 - TARAFLAR</h2>
          <p className="mb-4 text-gray-700">Bu Mesafeli Satış Sözleşmesi ("Sözleşme"), bir tarafta Kasarcım Peynir ("SATICI") ile diğer tarafta aşağıda bilgileri bulunan ALICI arasında akdedilmiştir.</p>
          <p className="mb-4 text-gray-700">SATICI bilgileri:</p>
          <p className="mb-4 text-gray-700">Unvan: Kasarcım Peynir Ltd. Şti.<br />Adres: Örnek Mahallesi, Peynir Sokak No:123, İstanbul<br />Telefon: 0212 123 45 67<br />E-posta: info@kasarcim.com</p>
          
          <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">MADDE 2 - KONU</h2>
          <p className="mb-4 text-gray-700">İşbu Sözleşme'nin konusu, ALICI'nın SATICI'ya ait kasarcim.com internet sitesinden elektronik ortamda siparişini verdiği, özellikleri ve satış fiyatı belirtilen ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
          
          <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">MADDE 3 - SÖZLEŞME KONUSU ÜRÜN/ÖDEME BİLGİLERİ</h2>
          <p className="mb-4 text-gray-700">Ürünlerin cinsi ve türü, miktarı, marka/modeli, satış bedeli, ödeme şekli, siparişin sonlandığı andaki bilgileri içeren sipariş özeti ve teslimat bilgileri aşağıda belirtildiği gibidir:</p>
          <p className="mb-4 text-gray-700">Sipariş Özeti: Siparişinizde belirtilen ürünler<br />Teslimat Adresi: Seçilen teslimat adresi<br />Sipariş Tutarı: {finalTotal.toFixed(2)} TL</p>
          
          <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">MADDE 4 - CAYMA HAKKI</h2>
          <p className="mb-4 text-gray-700">ALICI, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren 14 (ondört) gün içerisinde ürünü reddederek sözleşmeden cayma hakkına sahiptir. Cayma hakkı bildirimi kasarcim.com'a ait iletişim kanalları ile yapılmalıdır.</p>
          
          <p className="font-bold mt-6 mb-4 text-gray-800">Bu sözleşmeyi elektronik olarak onaylamanız, taraflar arasında sözleşmenin kurulması için yeterlidir.</p>
        </div>
        <div className="sticky bottom-0 bg-white rounded-b-xl p-4 border-t">
          <button 
            onClick={() => {
              setShowSalesContract(false);
              setAgreeSalesContract(true);
            }}
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Okudum ve Kabul Ediyorum
          </button>
        </div>
      </div>
    </div>
  );
  
  const InfoFormModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out">
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-15 backdrop-blur-[1px] transition-opacity duration-300"
        onClick={() => setShowInfoForm(false)}
      ></div>
      <div className="bg-white  rounded-xl w-full max-w-2xl max-h-[90vh] shadow-2xl relative z-10 transition-all duration-300 transform scale-100 opacity-100">
        <div className="sticky top-0 bg-white rounded-t-xl p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Ön Bilgilendirme Formu</h3>
          <button 
            onClick={() => setShowInfoForm(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 140px)', scrollbarWidth: 'thin', scrollbarColor: '#F97316 #f1f1f1' }}>
          <h2 className="text-xl font-bold mb-4 text-gray-800">1. SATICI BİLGİLERİ</h2>
          <p className="mb-4 text-gray-700">Unvan: Kasarcım Peynir Ltd. Şti.<br />Adres: Soğukpınar Mahallesi, Güleser Sokak No:4, Çekmeköy/İstanbul<br />Telefon: 0552 396 31 41<br />E-posta: info@kasarcim.com</p>
          
          <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">2. ÜRÜNLERİN TEMEL ÖZELLİKLERİ</h2>
          <p className="mb-4 text-gray-700">Ürünlerle ilgili temel özellikler ürün sayfalarında yer almaktadır. Ürün özellikleri hakkında daha detaylı bilgi için müşteri hizmetleri ile iletişime geçebilirsiniz.</p>
          
          <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">3. TOPLAM FİYAT</h2>
          <p className="mb-4 text-gray-700">Ürünlerin satış fiyatı, sipariş formunda yer almaktadır. Toplam fiyata vergiler ve kargo ücreti dahildir. Sipariş toplam tutarı: {finalTotal.toFixed(2)} TL</p>
          
          <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">4. ÖDEME VE TESLİMAT BİLGİLERİ</h2>
          <p className="mb-4 text-gray-700">Ödeme şekli: {paymentMethod === 'bank_transfer' ? 'Banka Havalesi / EFT' : 'Kapıda Ödeme'}<br />Teslimat adresi: Seçilen teslimat adresi<br />Tahmini teslimat süresi: 1-3 iş günü</p>
          
          <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">5. CAYMA HAKKI</h2>
          <p className="mb-4 text-gray-700">Tüketici, 14 (ondört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkı süresi, ürünün teslimatından itibaren başlar.</p>
        </div>
        <div className="sticky bottom-0 bg-white rounded-b-xl p-4 border-t">
          <button 
            onClick={() => {
              setShowInfoForm(false);
              setAgreeInfoForm(true);
            }}
            className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Okudum ve Kabul Ediyorum
          </button>
        </div>
        </div>
      </div>
    );
  
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
            
            {/* Sözleşme Onayları */}
            <div className="mt-6 space-y-3 border-t pt-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="salesContract"
                  className="h-5 w-5 rounded border-gray-300 text-orange-600 mt-0.5 focus:ring-orange-500"
                  checked={agreeSalesContract}
                  onChange={(e) => setAgreeSalesContract(e.target.checked)}
                />
                <label htmlFor="salesContract" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Mesafeli Satış Sözleşmesi</span>'ni okudum ve kabul ediyorum.
                  <button
                    type="button"
                    onClick={() => setShowSalesContract(true)}
                    className="ml-1 text-orange-500 hover:text-orange-600 font-medium"
                  >
                    [Oku]
                  </button>
                </label>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="infoForm"
                  className="h-5 w-5 rounded border-gray-300 text-orange-600 mt-0.5 focus:ring-orange-500"
                  checked={agreeInfoForm}
                  onChange={(e) => setAgreeInfoForm(e.target.checked)}
                />
                <label htmlFor="infoForm" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Ön Bilgilendirme Formu</span>'nu okudum ve kabul ediyorum.
                  <button
                    type="button"
                    onClick={() => setShowInfoForm(true)}
                    className="ml-1 text-orange-500 hover:text-orange-600 font-medium"
                  >
                    [Oku]
                  </button>
                </label>
              </div>
            </div>
            
            {/* Siparişi Tamamla Butonu */}
            <button
              type="button"
              onClick={submitOrder}
              disabled={!canCompleteOrder}
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
            
            {!canCompleteOrder && !processing && (
              <p className="text-xs text-orange-600 mt-2 text-center">
                Siparişi tamamlamak için sözleşmeleri kabul etmeniz gerekmektedir.
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Sözleşme Modalları */}
      {showSalesContract && <SalesContractModal />}
      {showInfoForm && <InfoFormModal />}
    </div>
  );
};

export default PaymentPage; 