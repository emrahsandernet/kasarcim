"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import Toast from '@/components/Toast';
import { CartService } from '@/services';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  
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
    
    Toast.success(`${product.name} sepete eklendi`);
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
      Toast.info(`${productToRemove.name} sepetten çıkarıldı`);
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
    
    Toast.info('Sepetiniz temizlendi');
  };
  
  // Kupon kodunu uygula
  const applyCoupon = async (code) => {
    if (!code || code.trim() === '') {
      Toast.warning('Lütfen geçerli bir kupon kodu girin');
      return;
    }
    
    // Token kontrolü
    const token = localStorage.getItem('token');
    if (!token) {
      Toast.error('Kupon uygulamak için giriş yapmalısınız');
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
      
      Toast.success(`${code} kuponu başarıyla uygulandı! ${data.discount_amount} TL indirim kazandınız.`);
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
      
      Toast.error(errorMessage);
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
    
    Toast.info('Kupon kodu kaldırıldı');
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