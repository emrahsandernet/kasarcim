"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Loader from '@/components/Loader';
import { FaMoneyBillAlt, FaCreditCard, FaRegCreditCard, FaTruck, FaCheck, FaFileAlt, FaInfoCircle, FaPlus } from 'react-icons/fa';
import { UserService, OrderService, CartService } from '@/services';

const AddressDrawer = ({ isOpen, onClose, guestInfo, setGuestInfo }) => {
  const [emailCorrected, setEmailCorrected] = useState(false);
  const [emailCorrection, setEmailCorrection] = useState('');
  const emailTimerRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      // Komponent unmount olduğunda zamanlayıcıyı temizle
      if (emailTimerRef.current) {
        clearTimeout(emailTimerRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Önce state'i hemen güncelle ki kullanıcı yazdığını görsün
    const updatedInfo = {
      ...guestInfo,
      [name]: value
    };
    
    setGuestInfo(updatedInfo);
    
    // E-posta düzeltme işlemi
    if (name === 'email' && value.includes('@')) {
      // Önceki zamanlayıcıyı temizle
      if (emailTimerRef.current) {
        clearTimeout(emailTimerRef.current);
      }
      
      // Yeni bir zamanlayıcı oluştur - 2 saniye gecikme ile
      emailTimerRef.current = setTimeout(() => {
        const originalValue = value;
        const correctedValue = correctEmailTypos(value);
        
        // Eğer bir düzeltme yapıldıysa
        if (correctedValue !== originalValue) {
          // State'i düzeltilmiş değerle güncelle
          const correctedInfo = {
            ...guestInfo,
            email: correctedValue
          };
          
          setGuestInfo(correctedInfo);
          
          // LocalStorage'ı güncelle
          if (typeof window !== 'undefined') {
            localStorage.setItem('guestInfo', JSON.stringify(correctedInfo));
          }
          
          // Düzeltme bildirimi göster
          setEmailCorrected(true);
          setEmailCorrection(`${originalValue} → ${correctedValue}`);
          
          // 3 saniye sonra bildirimi kaldır
          setTimeout(() => {
            setEmailCorrected(false);
          }, 3000);
        }
      }, 2000); // 2 saniye bekle
    }
    
    // LocalStorage'a kaydet
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestInfo', JSON.stringify(updatedInfo));
    }
  };

  // E-posta yazım hatalarını düzeltme fonksiyonu
  const correctEmailTypos = (email) => {
    if (!email || !email.includes('@')) return email;
    
    const [username, domain] = email.split('@');
    
    // Yaygın domain yazım hatalarını düzeltme
    const commonDomains = {
      // Gmail varyasyonları
      'gmail.co': 'gmail.com',
      'gmail.cm': 'gmail.com',
      'gmail.comm': 'gmail.com',
      'gmail.con': 'gmail.com',
      'gmail.ocm': 'gmail.com',
      'gmail.om': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmall.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gemail.com': 'gmail.com',
      
      // Hotmail varyasyonları
      'hotmail.co': 'hotmail.com',
      'hotmail.cm': 'hotmail.com',
      'hotmail.comm': 'hotmail.com',
      'hotmail.con': 'hotmail.com', 
      'hotmail.om': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'hotmail.coml': 'hotmail.com',
      'hotmial.com': 'hotmail.com',
      'homtail.com': 'hotmail.com',
      
      // Yahoo varyasyonları
      'yahoo.co': 'yahoo.com',
      'yahoo.cm': 'yahoo.com',
      'yahoo.comm': 'yahoo.com',
      'yahoo.con': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'yaoo.com': 'yahoo.com',
      
      // Outlook varyasyonları
      'outlook.co': 'outlook.com',
      'outlook.cm': 'outlook.com',
      'outlook.con': 'outlook.com',
      'outlook.comm': 'outlook.com',
      'outloo.com': 'outlook.com',
      'outlok.com': 'outlook.com',
      
      // Diğer yaygın domainler
      'yandex.co': 'yandex.com',
      'iclod.com': 'icloud.com',
      'icoud.com': 'icloud.com',
      'icloud.co': 'icloud.com'
    };
    
    if (commonDomains[domain]) {
      return `${username}@${commonDomains[domain]}`;
    }
    
    return email;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // LocalStorage'a kaydet
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestInfo', JSON.stringify(guestInfo));
    }
    
    onClose();
    
    // Modal kapandıktan sonra sipariş butonuna scroll yap
    setTimeout(() => {
      const orderButton = document.getElementById('order-submit-button');
      if (orderButton) {
        // Smooth scroll ile butonun bulunduğu yere kaydır
        orderButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300); // Modal kapanma animasyonu için kısa bir gecikme
  };

  return (
     <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex items-center justify-center min-h-screen text-center">
        {/* Arka plan overlay */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal içeriği - mobilde tam ekran */}
        <div 
          className="fixed inset-0 bg-white w-full h-full sm:static sm:inline-block sm:align-middle sm:bg-white sm:rounded-lg sm:text-left sm:shadow-xl sm:transform sm:transition-all sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-lg sm:relative z-50"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-4 py-6 bg-orange-500 sticky top-0 z-10 sm:rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Teslimat Adresiniz</h2>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-sm text-orange-100">Lütfen sipariş teslimatı için adres bilgilerinizi girin.</p>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Ad Soyad *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={guestInfo.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ahmet Yılmaz"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-posta *</label>
                <input
                  type="email"
                  name="email"
                  value={guestInfo.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${emailCorrected ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                  placeholder="ornek@mail.com"
                  required
                />
                {emailCorrected && (
                  <div className="mt-1 text-xs text-green-600 animate-pulse">
                    <span>Düzeltildi: {emailCorrection}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">+90</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={guestInfo.phone}
                    onChange={handleChange}
                    className="pl-12 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="5XX XXX XX XX"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adres *</label>
                <textarea
                  name="address"
                  value={guestInfo.address}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Mahalle, Cadde, Sokak, Bina No, Daire No"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">İl *</label>
                  <input
                    type="text"
                    name="city"
                    value={guestInfo.city}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="İstanbul"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">İlçe *</label>
                  <input
                    type="text"
                    name="district"
                    value={guestInfo.district}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Kadıköy"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Posta Kodu</label>
                <input
                  type="text"
                  name="postalCode"
                  value={guestInfo.postalCode}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="34000"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-orange-500 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Adresimi Kaydet ve Devam Et
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
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

  // Misafir kullanıcılar için form bilgileri
  const [guestInfo, setGuestInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: ''
  });

  // Adres drawer kontrolü
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false);

  // Sipariş Butonuna bir id ekleyelim ve ref kullanalım
  const orderButtonRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // LocalStorage'dan misafir bilgilerini yükle
    if (typeof window !== 'undefined') {
      const savedGuestInfo = localStorage.getItem('guestInfo');
      if (savedGuestInfo) {
        try {
          const parsedInfo = JSON.parse(savedGuestInfo);
          setGuestInfo(parsedInfo);
        } catch (error) {
          console.error('Guest info parsing error:', error);
        }
      }
    }
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

  /* Kullanıcı kontrolünü kaldırıyoruz
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      toast.error('Lütfen önce giriş yapın');
      router.push('/login?returnUrl=/odeme');
    }
  }, [mounted, authLoading, user, router]);
  */
  
  const shippingCost = cartTotal < 1500 ? 100 : 0;
  
  // Kapıda ödeme ücreti
  const cashOnDeliveryFee = paymentMethod === 'cash_on_delivery' ? 30 : 0;
  
  // Final toplam
  const finalTotal = discountedTotal + shippingCost + cashOnDeliveryFee;
  
  // Sepet boşsa ana sayfaya yönlendir
  useEffect(() => {
    if (mounted && cartItems.length === 0) {
      toast.error('Sepetiniz boş');
      router.push('/');
    }
  }, [mounted, cartItems, router]);
  
  // Adres listesini yükle (kullanıcı giriş yapmışsa)
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
  
  // Misafir bilgilerinde değişiklik olduğunda
  const handleGuestInfoChange = (e) => {
    const { name, value } = e.target;
    
    // E-posta düzeltme işlemi
    let correctedValue = value;
    if (name === 'email') {
      correctedValue = correctEmailTypos(value);
    }
    
    const updatedInfo = {
      ...guestInfo,
      [name]: correctedValue
    };
    
    setGuestInfo(updatedInfo);
    
    // LocalStorage'a kaydet
    if (typeof window !== 'undefined') {
      localStorage.setItem('guestInfo', JSON.stringify(updatedInfo));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer && cartItems.length > 0 && paymentMethod) {
      window.dataLayer.push({
        event: "add_payment_info",
        ecommerce: {
          currency: "TRY",
          payment_type: paymentMethod, // örn: bank_transfer, cash_on_delivery
          items: cartItems.map(item => ({
            item_id: item.id,
            item_name: item.name,
            item_brand: "Kaşarcım",
            item_category: item.category_name || item.category?.name || "Peynir",
            price: item.currentPrice || item.price,
            quantity: item.quantity
          }))
        }
      });
    }
  }, [paymentMethod]);
  
  // E-posta yazım hatalarını düzeltme fonksiyonu
  const correctEmailTypos = (email) => {
    if (!email || !email.includes('@')) return email;
    
    const [username, domain] = email.split('@');
    
    // Yaygın domain yazım hatalarını düzeltme
    const commonDomains = {
      // Gmail varyasyonları
   
      'gmal.com': 'gmail.com',
      'gmail.cm': 'gmail.com',
      'gmail.comm': 'gmail.com',
      'gmail.con': 'gmail.com',
      'gmail.ocm': 'gmail.com',
      'gmail.om': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmall.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gemail.com': 'gmail.com',
      
      // Hotmail varyasyonları
      'hotmail.co': 'hotmail.com',
      'hotmail.cm': 'hotmail.com',
      'hotmail.comm': 'hotmail.com',
      'hotmail.con': 'hotmail.com', 
      'hotmail.om': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'hotmail.coml': 'hotmail.com',
      'hotmial.com': 'hotmail.com',
      'homtail.com': 'hotmail.com',
      
      // Yahoo varyasyonları
      'yahoo.co': 'yahoo.com',
      'yahoo.cm': 'yahoo.com',
      'yahoo.comm': 'yahoo.com',
      'yahoo.con': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'yaoo.com': 'yahoo.com',
      
      // Outlook varyasyonları
      'outlook.co': 'outlook.com',
      'outlook.cm': 'outlook.com',
      'outlook.con': 'outlook.com',
      'outlook.comm': 'outlook.com',
      'outloo.com': 'outlook.com',
      'outlok.com': 'outlook.com',
      
      // Diğer yaygın domainler
      'yandex.co': 'yandex.com',
      'iclod.com': 'icloud.com',
      'icoud.com': 'icloud.com',
      'icloud.co': 'icloud.com'
    };
    
    if (commonDomains[domain]) {
      return `${username}@${commonDomains[domain]}`;
    }
    
    return email;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kullanıcı giriş yapmışsa adres kontrolü yap
    if (user && !selectedAddress) {
      toast.error('Lütfen bir adres seçin');
      return;
    }
    
    // Misafir kullanıcı ise form kontrolü yap
    if (!user) {
      if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone || !guestInfo.address || !guestInfo.city || !guestInfo.district) {
        toast.error('Lütfen tüm gerekli alanları doldurun');
        return;
      }
      
      // E-posta doğrulaması
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestInfo.email)) {
        toast.error('Lütfen geçerli bir e-posta adresi girin');
        return;
      }
      
      // Telefon doğrulaması (basit)
      if (guestInfo.phone.length < 8) {
        toast.error('Lütfen geçerli bir telefon numarası girin');
        return;
      }
    }
    
    setProcessing(true);
    
    try {
      // Sipariş verileri hazırla
      let orderData = {
        items: cartItems.map(item => {
          // Ondalık sayı formatını düzgün yapmak için
          const price = typeof item.currentPrice === 'number' ? 
            item.currentPrice.toFixed(2) : 
            (typeof item.price === 'number' ? 
              item.price.toFixed(2) : 
              (item.currentPrice || item.price).toString());
            
          return {
            product_id: parseInt(item.id), // ID'yi integer'a çevirelim
            quantity: parseInt(item.quantity), // Quantity'yi integer'a çevirelim
            price: price // String olarak fiyat
          };
        }),
        coupon_code: couponCode || null,
        payment_method: paymentMethod === 'cash_on_delivery' ? 'cash_on_delivery' : 'online',
        total_price: cartTotal,
        discount: discount,
        shipping_cost: shippingCost,
        final_price: finalTotal,
        notes: orderNotes
      };
      
      // Debug için konsola yazdır
      //console.log('Sipariş verileri:', JSON.stringify(orderData));
      
      // Kullanıcı giriş yapmışsa adres ID'sini ekle
      if (user) {
        orderData.address_id = selectedAddress;
      } else {
        // Misafir kullanıcı için adres bilgileri ekle
        orderData.guest_info = {
          full_name: guestInfo.fullName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          address: `${guestInfo.address}, ${guestInfo.district}`,
          city: guestInfo.city,
          district: guestInfo.district,
          postal_code: guestInfo.postalCode || ''
        };
      }
      
      // API isteği için try-catch bloğu
      try {
        // OrderService ile sipariş oluştur
        const order = await OrderService.createOrder(orderData);
        
        // Ödeme isteğini kaldırdık - otomatik oluşuyor
        // purchase event'ini gönder
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: "purchase",
            ecommerce: {
              transaction_id: order.id.toString(),
              value: finalTotal,
              currency: "TRY",
              payment_type: paymentMethod,
              items: cartItems.map(item => ({
                item_id: item.id,
                item_name: item.name,
                price: item.currentPrice || item.price,
                quantity: item.quantity
              }))
            }
          });
        }

        
        
        // Sepeti temizle
        clearCart();
      
        // Sipariş tamamlandı sayfasına yönlendir
        const redirectUrl = `/siparis-basarili?orderId=${order.id}&total=${finalTotal}&paymentMethod=${paymentMethod}`;
      window.location.href = redirectUrl;
    } catch (error) {
        // API hata yanıtını ele al
        console.error('API hatası:', error);
      
      let errorMessage = 'Bir hata oluştu';
        
        // Hata yanıtını kontrol et
        if (error.response && error.response.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else {
            errorMessage = JSON.stringify(error.response.data);
          }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Ödeme hatası:', error);
      toast.error('İşlem sırasında bir hata oluştu');
    } finally {
      setProcessing(false);
    }
  };
  
  // Form submit fonksiyonu
  const submitOrder = () => {
    if (formRef.current) {
      // Adres kontrolü
      if (user && !selectedAddress) {
        toast.error('Lütfen bir adres seçin');
        // Adres bölümüne scroll
        document.querySelector('#address-section')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      
      // Misafir kullanıcı için form kontrolü
      if (!user) {
        if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone || !guestInfo.address || !guestInfo.city || !guestInfo.district) {
          toast.error('Lütfen adres bilgilerinizi eksiksiz doldurun');
          setAddressDrawerOpen(true);
          return;
        }
      }
      
      // Sözleşme onaylarını kontrol et
      if (!agreeSalesContract) {
        toast.error('Lütfen Mesafeli Satış Sözleşmesini kabul edin');
        document.querySelector('#sales-contract')?.scrollIntoView({ behavior: 'smooth' });
        document.querySelector('#sales-contract')?.focus();
        return;
      }
      
      if (!agreeInfoForm) {
        toast.error('Lütfen Genel Bilgilendirme Sözleşmesi\'ni kabul edin');
        document.querySelector('#info-form')?.scrollIntoView({ behavior: 'smooth' });
        document.querySelector('#info-form')?.focus();
        return;
      }
      
      // Tüm koşullar sağlandıysa formu gönder
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };
  
  // Sipariş tamamlanabilir mi kontrolü (artık buton disabling için kullanılmayacak)
  const canCompleteOrder = (user ? selectedAddress : 
    (guestInfo.fullName && guestInfo.email && guestInfo.phone && guestInfo.address && guestInfo.city && guestInfo.district)) && 
    agreeSalesContract && agreeInfoForm && !processing;
  
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <Loader size="large" />
      </div>
    );
  }
  
  // Satış sözleşmesi modal
  const SalesContractModal = () => {
    // Modal açıldığında scroll engelleme
    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }, []);

    // Modal kapatma ve checkbox işaretleme işlevi
    const handleConfirm = () => {
      setAgreeSalesContract(true);
      setShowSalesContract(false);
    };

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen text-center">
          {/* Arka plan overlay */}
          <div className="fixed inset-0 transition-opacity" onClick={() => setShowSalesContract(false)}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

          {/* Modal içeriği - mobilde tam ekran */}
          <div 
            className="fixed inset-0 bg-white w-full h-full sm:static sm:inline-block sm:align-middle sm:bg-white sm:rounded-lg sm:text-left sm:shadow-xl sm:transform sm:transition-all sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-lg sm:relative z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-6 bg-orange-500 sticky top-0 z-10 sm:rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">Mesafeli Satış Sözleşmesi</h2>
          <button 
            onClick={() => setShowSalesContract(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
          >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
          </button>
        </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold mb-4">MESAFELI SATIŞ SÖZLEŞMESI</h3>
                
                <h4 className="font-bold">1. TARAFLAR</h4>
                <p><strong>SATICI:</strong><br />
                Ünvanı: Kaşarcım<br />
                Adresi: Çekmeköy/İstanbul<br />
                Telefon: 0532 XXX XX XX<br />
                E-mail: info@kasarcim.com<br />
                </p>
                
                <p><strong>ALICI:</strong><br />
                Adı/Soyadı/Ünvanı: Sipariş formunda belirtilen kişi<br />
                Adresi: Sipariş formunda belirtilen adres<br />
                Telefon: Sipariş formunda belirtilen telefon<br />
                E-mail: Sipariş formunda belirtilen e-posta<br />
                </p>
                
                <h4 className="font-bold mt-6">2. KONU</h4>
                <p>İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait www.kasarcim.com internet sitesinden elektronik ortamda siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini düzenler.</p>
                
                <h4 className="font-bold mt-6">3. SÖZLEŞME KONUSU ÜRÜN/ÜRÜNLER BILLGISI</h4>
                <p>Ürünlerin Cinsi ve Türü, Miktarı, Satış Bedeli sipariş formunda listelendiği gibidir.</p>
                <p>Ödeme Şekli: Kredi Kartı/Banka Havalesi/Kapıda Ödeme</p>
                <p>Teslimat Koşulları: Kargo veya Kurye ile adrese teslim</p>
                <p>Teslim Süresi: Ürün siparişinden itibaren 3 iş günü içerisinde kargoya teslim edilecektir.</p>
                <p>Teslimat Masrafları: Sepet tutarı 1500 TL üzeri alışverişlerde kargo ücretsizdir. 1500 TL altı siparişlerde kargo ücreti ALICI tarafından karşılanacaktır.</p>
                
                <h4 className="font-bold mt-6">4. GENEL HÜKÜMLER</h4>
                <p>4.1 ALICI, www.kasarcim.com internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu, elektronik ortamda satış için gerekli teyidi verdiğini kabul, beyan ve taahhüt eder.</p>
                <p>4.2 Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile internet sitesinde yer alan teslimat koşulları çerçevesinde kargo veya kurye aracılığı ile ALICI'nın belirttiği adrese teslim edilecektir.</p>
                <p>4.3 SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri, kullanım kılavuzları ile teslim edilmesinden sorumludur.</p>
                <p>4.4 Sözleşme konusu ürünün teslimatı için sözleşmenin düzenlenmesi ve ödemenin yapılmış olması gereklidir. Ödeme yapılmadan ürün teslimatı yapılmaz.</p>
                <p>4.5 Ürünün tesliminden sonra ALICI'ya ait kredi kartının ALICI'nın kusurundan kaynaklanmayan bir şekilde yetkisiz kişilerce haksız veya hukuka aykırı olarak kullanılması nedeni ile ilgili banka veya finans kuruluşun ürün bedelini SATICI'ya ödememesi halinde, ALICI'nın kendisine teslim edilmiş olması kaydıyla ürünün SATICI'ya gönderilmesi zorunludur.</p>
                
                <h4 className="font-bold mt-6">5. CAYMA HAKKI</h4>
                <p>5.1 ALICI, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, mal satışına ilişkin işlemlerde teslimat tarihinden itibaren 14 (on dört) gün içerisinde malı reddederek sözleşmeden cayma hakkını kullanabilir.</p>
                <p>5.2 Gıda ürünleri ve son kullanma tarihi olan ürünler, açıldığında iadesi sağlık koşulları açısından mümkün olmayan ürünler cayma hakkı kapsamı dışındadır. Bu nedenle süt ürünleri ve peynir ürünleri kısa ömürlü gıda ürünleri kapsamına girdiği için cayma hakkı kapsamı dışındadır.</p>

                <h4 className="font-bold mt-6">6. UYUŞMAZLIK ÇÖZÜMÜ</h4>
                <p>İşbu sözleşme ile ilgili çıkacak ihtilaflarda; her yıl Ticaret Bakanlığı tarafından ilan edilen değere kadar Tüketici Hakem Heyetleri, üzerinde ise tüketicinin veya satıcının yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.</p>
                
                <p className="mt-6">SATICI: Kaşarcım</p>
                <p>ALICI: Sipariş veren kişi</p>
                <p>Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
        </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0">
          <button 
                onClick={handleConfirm}
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Okudum, Onayladım
          </button>
            </div>
        </div>
      </div>
    </div>
  );
  };
  
  // Aydınlatma formu modal
  const InfoFormModal = () => {
    // Modal açıldığında scroll engelleme
    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }, []);
    
    // Modal kapatma ve checkbox işaretleme işlevi
    const handleConfirm = () => {
      setAgreeInfoForm(true);
      setShowInfoForm(false);
    };
    
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen text-center">
          {/* Arka plan overlay */}
          <div className="fixed inset-0 transition-opacity" onClick={() => setShowInfoForm(false)}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          {/* Modal içeriği - mobilde tam ekran */}
          <div 
            className="fixed inset-0 bg-white w-full h-full sm:static sm:inline-block sm:align-middle sm:bg-white sm:rounded-lg sm:text-left sm:shadow-xl sm:transform sm:transition-all sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-lg sm:relative z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-6 bg-orange-500 sticky top-0 z-10 sm:rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">Genel Bilgilendirme Sözleşmesi</h2>
          <button 
            onClick={() => setShowInfoForm(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
          >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
          </button>
        </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 80px)' }}>
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold mb-4">GENEL BİLGİLENDİRME SÖZLEŞMESİ</h3>
                
                <p>Değerli müşterilerimiz,</p>
                
                <p>Kasarcım olarak sizlere sunduğumuz hizmetler ve ürünler hakkında aşağıdaki bilgileri paylaşmak isteriz:</p>
                
                <h4 className="font-bold mt-6">1. ÜRÜNLER HAKKINDA</h4>
                <p>Sitemizde satışa sunulan tüm peynir ürünlerimiz, özenle seçilmiş üreticilerden temin edilmektedir. Ürünlerimiz doğal koşullarda üretilmekte ve en iyi şekilde korunarak sizlere ulaştırılmaktadır.</p>
          
                <h4 className="font-bold mt-6">2. TESLİMAT KOŞULLARI</h4>
                <p>Siparişleriniz, ödeme onayından sonra 1-3 iş günü içerisinde kargoya verilmektedir. Kargo firmasına teslim edildikten sonra genellikle 1-2 iş günü içerisinde adresinize ulaştırılmaktadır. Soğuk zincir gerektiren ürünlerimiz, özel soğutucu kutular içerisinde gönderilmektedir.</p>
          
                <h4 className="font-bold mt-6">3. İADE KOŞULLARI</h4>
                <p>Gıda ürünleri ve son kullanma tarihi olan ürünler, sağlık ve hijyen koşulları nedeniyle iade kapsamı dışındadır. Ancak ürünlerin size ulaştığında herhangi bir hasar görmüş olması durumunda, durumu 24 saat içerisinde bildirmeniz halinde gerekli işlemler başlatılacaktır.</p>
          
                <h4 className="font-bold mt-6">4. MÜŞTERİ BİLGİLERİ</h4>
                <p>Sipariş sürecinde paylaştığınız kişisel bilgileriniz, siparişinizin tamamlanması, teslimatın gerçekleştirilmesi ve gerektiğinde sizinle iletişim kurulabilmesi amacıyla kullanılmaktadır. Bu bilgiler, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmamaktadır.</p>
          
                <h4 className="font-bold mt-6">5. İLETİŞİM</h4>
                <p>Herhangi bir sorunuz veya sorununuz olduğunda, info@kasarcim.com e-posta adresi veya sitemizde belirtilen telefon numarası üzerinden bizimle iletişime geçebilirsiniz. Müşteri hizmetleri ekibimiz, sorularınızı yanıtlamaktan memnuniyet duyacaktır.</p>
                
                <p className="mt-6">Bu bilgilendirme metni, Kasarcım web sitesi ve uygulaması üzerinden yapacağınız alışverişlerde sizlere rehberlik etmek amacıyla hazırlanmıştır. Sitemizden alışveriş yaparak, bu bilgileri okuduğunuzu ve kabul ettiğinizi beyan etmiş olursunuz.</p>
                
                <p className="mt-4">Kasarcım ailesine katıldığınız için teşekkür ederiz.</p>
        </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0">
          <button 
                onClick={handleConfirm}
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Okudum, Onayladım
          </button>
            </div>
        </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Ödeme</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sol Kolon - Sipariş Bilgileri */}
        <div className="lg:w-2/3 space-y-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            
            {/* Kullanıcı Giriş Durumu */}
            {!user && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-orange-500" />
                  <span className="font-medium text-orange-700">Misafir olarak devam ediyorsunuz</span>
                </div>
                <p className="text-sm text-orange-600 mb-3">
                  Zaten bir hesabınız var mı? <Link href="/login" className="text-orange-700 font-medium underline">Giriş yapın</Link> veya aşağıdaki bilgileri doldurarak misafir olarak devam edin.
                </p>
              </div>
            )}
            
            {/* Adres Seçimi (Kullanıcı giriş yapmışsa) */}
            {user ? (
              <div id="address-section" className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <FaTruck className="mr-2 text-orange-500" /> Teslimat Adresi
                </h2>
                
                {addresses.length > 0 ? (
                  <div className="space-y-4">
                  {addresses.map(address => (
                    <div 
                      key={address.id} 
                        className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${selectedAddress === address.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                        <input
                          type="radio"
                          id={`address-${address.id}`}
                          name="address"
                          value={address.id}
                          checked={selectedAddress === address.id}
                          onChange={() => setSelectedAddress(address.id)}
                          className="hidden"
                        />
                        <label
                          htmlFor={`address-${address.id}`}
                          className="block cursor-pointer"
                        >
                          <div className="px-5 py-4 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                        <div>
                                  <h3 className="font-medium text-lg">{address.title}</h3>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {address.address}, {address.district}/{address.city}
                                  </p>
                                  <p className="text-gray-500 text-sm mt-1">
                                    {address.phone}
                                  </p>
                          </div>
                        </div>
                            </div>
                            <div className="flex flex-col items-end justify-between h-full">
                              {address.is_default && (
                                <span className="text-xs bg-orange-100 text-orange-600 py-1 px-2 rounded mb-2">Varsayılan</span>
                              )}
                              <div className={`h-6 w-6 border-2 rounded-full ${selectedAddress === address.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                        {selectedAddress === address.id && (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <FaCheck className="text-white text-xs" />
                          </div>
                        )}
                      </div>
                            </div>
                          </div>
                        </label>
                    </div>
                  ))}
                  
                    <Link href="/adreslerim?returnUrl=/odeme" className="block w-full p-3 border border-dashed border-orange-300 rounded-lg text-center text-orange-500 hover:bg-orange-50 transition duration-200">
                      <div className="flex items-center justify-center">
                        <FaPlus className="mr-2" /> Yeni Adres Ekle
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">Henüz kayıtlı adresiniz bulunmuyor.</p>
                    <Link 
                      href="/adreslerim?returnUrl=/odeme" 
                      className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition"
                    >
                      Adres Ekle
                    </Link>
                </div>
              )}
            </div>
            ) : (
              // Misafir kullanıcı için adres bilgisi özeti (drawer form yerine)
              <div id="address-section" className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <FaTruck className="mr-2 text-orange-500" /> Teslimat Bilgileri
                </h2>
                
                {guestInfo.fullName && guestInfo.address ? (
                  <div className="border rounded-lg p-4 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{guestInfo.fullName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {guestInfo.address}, {guestInfo.district}/{guestInfo.city}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {guestInfo.phone}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {guestInfo.email}
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setAddressDrawerOpen(true)}
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                      >
                        Düzenle
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">Henüz teslimat adresi girmediniz.</p>
                    <button
                      type="button"
                      onClick={() => setAddressDrawerOpen(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition"
                    >
                      Adres Bilgilerini Gir
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Ödeme Yöntemi */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <FaCreditCard className="mr-2 text-orange-500" /> Ödeme Yöntemi
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div 
                  className={`border-2 ${paymentMethod === 'bank_transfer' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'} rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md`}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <input 
                    type="radio" 
                    id="bank-transfer" 
                    name="payment-method" 
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'} 
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="hidden" 
                  />
                  <label htmlFor="bank-transfer" className="block cursor-pointer">
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="rounded-full bg-orange-100 p-3 mr-4">
                          <FaMoneyBillAlt className="text-orange-500 text-2xl" />
                    </div>
                        <div>
                          <h3 className="font-medium text-lg">Havale / EFT</h3>
                          <p className="text-gray-600 text-sm">
                            Siparişinizi banka havalesi ya da EFT ile ödeyebilirsiniz
                          </p>
                  </div>
                      </div>
                      <div className={`h-6 w-6 border-2 rounded-full ${paymentMethod === 'bank_transfer' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                        {paymentMethod === 'bank_transfer' && (
                          <div className="h-full w-full flex items-center justify-center">
                            <FaCheck className="text-white text-xs" />
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
                
                <div 
                  className={`border-2 border-gray-200 rounded-xl overflow-hidden opacity-60 bg-gray-50`}
                >
                  <input 
                    type="radio" 
                    id="credit-card" 
                    name="payment-method" 
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'} 
                    onChange={() => {}} 
                    className="hidden" 
                    disabled
                  />
                  <label htmlFor="credit-card" className="block">
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="rounded-full bg-gray-200 p-3 mr-4">
                          <FaRegCreditCard className="text-gray-500 text-2xl" />
                    </div>
                        <div>
                          <h3 className="font-medium text-lg">Kredi Kartı<span className="ml-2 text-sm text-gray-500">(Çok yakında)</span></h3>
                          <p className="text-gray-500 text-sm">
                            Güvenli ödeme altyapımız ile bütün kartlar desteklenir
                          </p>
                      </div>
                  </div>
                      <div className="h-6 w-6 border-2 rounded-full border-gray-300">
                      </div>
                    </div>
                  </label>
                </div>
                
                <div 
                  className={`border-2 ${paymentMethod === 'cash_on_delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'} rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md`}
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                >
                  <input 
                    type="radio" 
                    id="cash-delivery" 
                    name="payment-method" 
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'} 
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="hidden" 
                  />
                  <label htmlFor="cash-delivery" className="block cursor-pointer">
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="rounded-full bg-orange-100 p-3 mr-4">
                          <FaMoneyBillAlt className="text-orange-500 text-2xl" />
                    </div>
                        <div>
                          <h3 className="font-medium text-lg">Kapıda Ödeme <span className="text-sm text-orange-600 font-normal">(+50 TL)</span></h3>
                          <p className="text-gray-600 text-sm">
                            Teslimat anında nakit veya kart ile ödeme
                          </p>
                  </div>
                      </div>
                      <div className={`h-6 w-6 border-2 rounded-full ${paymentMethod === 'cash_on_delivery' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                  {paymentMethod === 'cash_on_delivery' && (
                          <div className="h-full w-full flex items-center justify-center">
                            <FaCheck className="text-white text-xs" />
                    </div>
                  )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Sipariş Notu */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <FaFileAlt className="mr-2 text-orange-500" /> Sipariş Notu
              </h2>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Siparişinizle ilgili eklemek istediğiniz notlar (opsiyonel)"
                rows="3"
              ></textarea>
            </div>
          </form>
        </div>
        
        {/* Sağ Kolon - Sipariş Özeti */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 sticky top-24 z-10">
            <h2 className="text-lg font-medium mb-4">Sipariş Özeti</h2>
            
            {/* Ürün Listesi */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                    <Image 
                      src={item.img_url || "/images/placeholder.png"} 
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs">Miktar: {item.quantity}</p>
                    <p className="font-medium text-orange-500">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
                        item.currentPrice * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Fiyat Detayları */}
            <div className="space-y-2 py-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam</span>
                <span className="font-medium">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cartTotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">İndirim</span>
                  <span className="font-medium text-green-500">-{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kargo</span>
                {shippingCost > 0 ? (
                  <span className="font-medium">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(shippingCost)}</span>
                ) : (
                  <span className="font-medium text-green-500">Ücretsiz</span>
                )}
              </div>
              
              {paymentMethod === 'cash_on_delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kapıda Ödeme Ücreti</span>
                  <span className="font-medium">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cashOnDeliveryFee)}</span>
                </div>
              )}
            </div>
            
            {/* Toplam */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Toplam</span>
                <span className="font-bold text-lg text-orange-600">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(finalTotal)}
                </span>
              </div>
              
              <button
                type="button"
                id="order-submit-button"
                ref={orderButtonRef}
                onClick={submitOrder}
                className={`w-full py-3 rounded-lg font-medium text-center ${
                  processing 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                } transition-colors`}
                disabled={processing}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <Loader size="small" /> 
                    <span className="ml-2">İşleniyor...</span>
            </div>
                ) : (
                  'Siparişi Tamamla'
                )}
              </button>
            
              {/* Sözleşme onay kutuları */}
              <div className="mt-4 space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                    id="sales-contract" 
                  checked={agreeSalesContract}
                  onChange={(e) => setAgreeSalesContract(e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded" 
                />
                  <label htmlFor="sales-contract" className="ml-2 block text-sm text-gray-700">
                  <button
                    type="button"
                      className="text-orange-500 hover:underline"
                    onClick={() => setShowSalesContract(true)}
                  >
                      Mesafeli Satış Sözleşmesi
                    </button>'ni okudum ve kabul ediyorum.
                </label>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                    id="info-form" 
                  checked={agreeInfoForm}
                  onChange={(e) => setAgreeInfoForm(e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded" 
                />
                  <label htmlFor="info-form" className="ml-2 block text-sm text-gray-700">
                  <button
                    type="button"
                      className="text-orange-500 hover:underline"
                    onClick={() => setShowInfoForm(true)}
                  >
                      Genel Bilgilendirme Sözleşmesi
                    </button>'ni okudum ve kabul ediyorum.
                </label>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Adres Drawer'ı */}
      <AddressDrawer 
        isOpen={addressDrawerOpen} 
        onClose={() => setAddressDrawerOpen(false)} 
        guestInfo={guestInfo} 
        setGuestInfo={setGuestInfo} 
      />
      
      {/* Sözleşme Modalleri */}
      {showSalesContract && <SalesContractModal />}
      {showInfoForm && <InfoFormModal />}
    </div>
  );
};

export default PaymentPage; 