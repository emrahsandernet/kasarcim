"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CartService } from '@/services';
import Image from 'next/image';
import { FaShoppingCart, FaInfoCircle, FaExclamationTriangle, FaTimesCircle, FaTag } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  
  // Ortak toast stilleri
  const toastStyle = {
    background: 'linear-gradient(to right, #FFF7ED, #FFF8F1)',
    boxShadow: '0 8px 30px rgba(255, 107, 0, 0.15)',
    padding: '16px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 107, 0, 0.2)',
    width: 'auto',
    maxWidth: '420px',
  };
  
  // LocalStorage'dan sepeti yükle
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart.items || parsedCart);
        
        // Kupon bilgilerini de yükle (eğer varsa)
        if (parsedCart.couponCode) {
          setCouponCode(parsedCart.couponCode);
          setDiscount(parsedCart.discount || 0);
        }
      }
    } catch (error) {
      console.error('Sepet yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sepeti LocalStorage'a kaydet
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify({
        items: cartItems,
        couponCode,
        discount
      }));
    }
  }, [cartItems, couponCode, discount, loading]);
  
  // Sepet sayfasına yönlendirme yapacak fonksiyon
  const navigateToCart = () => {
    router.push('/sepet');
  };
  
  // Sepete ürün ekle
  const addToCart = (product, quantity = 1) => {
    // Sepet state'ini güncellemeden önce yeni state'i hazırlayalım
    const newCartItems = [...cartItems];
    
    // Eğer ürün zaten sepette varsa, sadece miktarını arttır
    const existingItemIndex = newCartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      newCartItems[existingItemIndex].quantity += quantity;
    } else {
      // İndirim ve fiyat hesaplamaları
      const isDiscounted = product.active_discount !== null && product.active_discount !== undefined;
      const currentPrice = isDiscounted ? product.discounted_price : product.price;
      
      // Ürün sepette yoksa, yeni ürün olarak ekle
      newCartItems.push({
        ...product,
        quantity,
        currentPrice
      });
    }
    
    // State'i güncelle
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
    
    // Modern toast ile bildirimi göster
    toast((t) => (
      <div className="flex flex-col w-full relative">
        <div className="flex items-start w-full ">
          {product.img_url && (
            <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 mr-2">
              <Image 
                src={product.img_url || "/images/placeholder.png"} 
                alt={product.name}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className="flex-grow">
            <div className="text-sm font-medium text-orange-700">{product.name} sepete eklendi</div>
            <div className="text-xs text-orange-500">{quantity} adet</div>
          </div>
        </div>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            navigateToCart();
          }}
          className="absolute top-6 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm py-1.5 px-4 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center">
            <FaShoppingCart className="mr-1.5 text-xs" />
            Sepete Git
          </div>
        </button>
      </div>
    ), {
      duration: 3000,
      style: {
        ...toastStyle,
        padding: '12px',
        paddingBottom: '28px' // Buton için daha az alan
      },
      position: 'bottom-right',
      icon: null,
    });
  };
  
  // Sepetten ürün kaldır
  const removeFromCart = (productId) => {
    // Ürün adını toast mesajında kullanmak için önce bulalım
    const productToRemove = cartItems.find(item => item.id === productId);
    // Ürünü sepetten çıkar
    const newCartItems = cartItems.filter(item => item.id !== productId);
    
    // State'i güncelle
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
    
    if (productToRemove) {
      toast.success(`${productToRemove.name} sepetten çıkarıldı`, {
        icon: <FaInfoCircle className="text-orange-500" />,
        style: toastStyle,
        position: 'bottom-right',
      });
    }
  };
  
  // Sepetteki ürün miktarını güncelle
  const updateQuantity = (productId, quantity) => {
    // Miktar geçerli mi kontrol et
    if (quantity < 1) return;
    
    // Sepet öğelerini güncelle
    const newCartItems = cartItems.map(item => {
      if (item.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    // State'i güncelle
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };
  
  // Sepeti temizle
  const clearCart = () => {
    // Sepeti temizle
    setCartItems([]);
    localStorage.removeItem('cartItems');
    
    // Kupon varsa temizle
    setCouponCode('');
    setDiscount(0);
    localStorage.removeItem('coupon');
    localStorage.removeItem('discount');
    
    toast.success('Sepetiniz temizlendi', {
      icon: <FaInfoCircle className="text-orange-500" />,
      style: toastStyle,
      position: 'bottom-right',
    });
  };
  
  // Kupon kodunu uygula
  const applyCoupon = async (code) => {
    if (!code || code.trim() === '') {
      toast((t) => (
        <div className="flex items-center">
          <FaExclamationTriangle className="text-yellow-500 mr-2" />
          <span className="text-yellow-700">Lütfen geçerli bir kupon kodu girin</span>
        </div>
      ), {
        style: {
          ...toastStyle,
          background: 'linear-gradient(to right, #FFFBEB, #FEF9C3)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        },
        position: 'bottom-right',
      });
      return;
    }
    
    // Token kontrolü
    const token = localStorage.getItem('token');
    if (!token) {
      toast((t) => (
        <div className="flex items-center">
          <FaTimesCircle className="text-red-500 mr-2" />
          <span className="text-red-700">Kupon uygulamak için giriş yapmalısınız</span>
        </div>
      ), {
        style: {
          ...toastStyle,
          background: 'linear-gradient(to right, #FEF2F2, #FFF1F1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        },
        position: 'bottom-right',
      });
      return;
    }
    
    // Kupon yükleme durumunu başlat
    setCouponLoading(true);
    
    try {
      // CartService kullanarak kupon kodu doğrulama isteği gönder
      const data = await CartService.applyCoupon(code, cartTotal);
      
      // Kupon başarıyla uygulandı
      setCouponCode(code);
      setDiscount(data.discount_amount || 0);
      
      // Local storage'a kaydet
      localStorage.setItem('coupon', code);
      localStorage.setItem('discount', data.discount_amount || 0);
      
      toast((t) => (
        <div className="flex items-center">
          <FaTag className="text-orange-500 mr-2" />
          <div>
            <div className="text-sm font-medium text-orange-700">{code} kuponu başarıyla uygulandı!</div>
            <div className="text-xs text-orange-500">{data.discount_amount} TL indirim kazandınız</div>
          </div>
        </div>
      ), {
        style: toastStyle,
        position: 'bottom-right',
        duration: 4000,
      });
    } catch (error) {
      console.error('Kupon uygulama hatası:', error);
      
      // Hata durumunda kupon bilgilerini temizle
      setCouponCode('');
      setDiscount(0);
      localStorage.removeItem('coupon');
      localStorage.removeItem('discount');
      
      // Hata mesajını oluştur
      let errorMessage = 'Kupon uygulanırken bir hata oluştu';
      if (error.data && error.data.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast((t) => (
        <div className="flex items-center">
          <FaTimesCircle className="text-red-500 mr-2" />
          <span className="text-red-700">{errorMessage}</span>
        </div>
      ), {
        style: {
          ...toastStyle,
          background: 'linear-gradient(to right, #FEF2F2, #FFF1F1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        },
        position: 'bottom-right',
      });
    } finally {
      setCouponLoading(false);
    }
  };
  
  // Kupon kodunu kaldır
  const removeCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    localStorage.removeItem('coupon');
    localStorage.removeItem('discount');
    
    toast.success('Kupon kodu kaldırıldı', {
      icon: <FaInfoCircle className="text-orange-500" />,
      style: toastStyle,
      position: 'bottom-right',
    });
  };
  
  // Sepet toplamını hesapla (indirimli fiyatları kullanarak)
  const cartTotal = cartItems.reduce(
    (total, item) => {
      // currentPrice varsa onu, yoksa indirimli veya normal fiyatı kullan
      const itemPrice = item.currentPrice !== undefined ? 
        item.currentPrice : 
        (item.active_discount && item.discounted_price !== null ? item.discounted_price : item.price);
      
      return total + itemPrice * item.quantity;
    },
    0
  );
  
  // Kargo ücretini hesapla
  const shippingCost = cartTotal < 1500 ? 250 : 0;
  
  // İndirimli toplam tutarı hesapla
  const discountedTotal = Math.max(0, cartTotal - discount);
  
  // Sepetteki toplam ürün sayısı
  const cartItemsCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  
  // Sipariş oluştur
  const createOrder = async (orderData) => {
    try {
      return await CartService.createOrder(orderData);
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      throw error;
    }
  };
  
  // Ödeme oturumu oluştur
  const createPaymentSession = async (orderData) => {
    try {
      return await CartService.createPaymentSession(orderData);
    } catch (error) {
      console.error('Ödeme oturumu oluşturma hatası:', error);
      throw error;
    }
  };
  
  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartItemsCount,
      loading,
      couponCode,
      discount,
      discountedTotal,
      shippingCost,
      applyCoupon,
      removeCoupon,
      couponLoading,
      createOrder,
      createPaymentSession
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 