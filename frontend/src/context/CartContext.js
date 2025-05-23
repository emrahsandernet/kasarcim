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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
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
      // Önce eski format ile kontrol et (cart key)
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart.items || parsedCart);
        
        // Kupon bilgilerini de yükle (eğer varsa)
        if (parsedCart.couponCode) {
          setCouponCode(parsedCart.couponCode);
          setDiscount(parsedCart.discount || 0);
        }
        // Eski formatı temizle
        localStorage.removeItem('cart');
      } else {
        // Yeni format ile kontrol et (cartItems key)
        const savedCartItems = localStorage.getItem('cartItems');
        if (savedCartItems) {
          const parsedItems = JSON.parse(savedCartItems);
          setCartItems(parsedItems);
        }
      }
      
      // Ayrıca kupon bilgilerini de yükle
      const savedCoupon = localStorage.getItem('coupon');
      const savedDiscount = localStorage.getItem('discount');
      if (savedCoupon) {
        setCouponCode(savedCoupon);
        setDiscount(parseFloat(savedDiscount) || 0);
      }
    } catch (error) {
      console.error('Sepet yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sepeti LocalStorage'a kaydet
  useEffect(() => {
    if (!loading && cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);
  
  // Kupon bilgilerini ayrı kaydet
  useEffect(() => {
    if (!loading) {
      if (couponCode) {
        localStorage.setItem('coupon', couponCode);
        localStorage.setItem('discount', discount.toString());
      } else {
        localStorage.removeItem('coupon');
        localStorage.removeItem('discount');
      }
    }
  }, [couponCode, discount, loading]);
  
  // Drawer kontrol fonksiyonları
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  
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
      const currentPrice = isDiscounted ? (parseFloat(product.discounted_price) || parseFloat(product.price) || 0) : (parseFloat(product.price) || 0);
      
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
    // 👉 GA4 / GTM için add_to_cart eventi gönder
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          items: [
            
            {
              item_name: product.name,
              item_id: product.id,
              price: product.currentPrice,
              quantity: quantity
            }
          ]
        }
      });
    }
    
    // Drawer'ı aç
    openDrawer();
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
    // 👉 GA4 / GTM için remove_from_cart eventi gönder
    if (typeof window !== 'undefined' && window.dataLayer && productToRemove) {
      window.dataLayer.push({
        event: 'remove_from_cart',
        ecommerce: {
          items: [
            {
              item_name: productToRemove.name,
              item_id: productToRemove.id,
              price: productToRemove.currentPrice || productToRemove.price,
              quantity: productToRemove.quantity || 1
            }
          ]
        }
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
    
   
  };
  
  // Kupon kodunu uygula
  const applyCoupon = async (code) => {
    if (!code || code.trim() === '') {
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
  };
  
  // Sepet toplamını hesapla (indirimli fiyatları kullanarak)
  const cartTotal = cartItems.reduce(
    (total, item) => {
      // currentPrice varsa onu, yoksa indirimli veya normal fiyatı kullan
      const itemPrice = item.currentPrice !== undefined ? 
        parseFloat(item.currentPrice) || 0 : 
        (item.active_discount && item.discounted_price !== null ? 
          parseFloat(item.discounted_price) || 0 : 
          parseFloat(item.price) || 0);
      
      return total + itemPrice * (parseInt(item.quantity) || 0);
    },
    0
  );
  
  // Kargo ücretini hesapla
  const shippingCost = cartTotal < 1500 ? 100 : 0;
  
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
      createPaymentSession,
      isDrawerOpen,
      openDrawer,
      closeDrawer
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 