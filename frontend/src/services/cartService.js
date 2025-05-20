import api from './api';

// Alışveriş sepeti servisi
const CartService = {
  // Kupon kodunu kontrol et ve uygula
  applyCoupon: async (code, cartTotal) => {
    try {
      return await api.post('coupons/apply/', {
        code,
        cart_total: cartTotal
      });
    } catch (error) {
      console.error('Kupon uygulama hatası:', error);
      throw error;
    }
  },
  
  // Sipariş oluştur
  createOrder: async (orderData) => {
    try {
      return await api.post('orders/', orderData);
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      throw error;
    }
  },
  
  // Ödeme oturumu oluştur
  createPaymentSession: async (paymentData) => {
    try {
      // Backend'de create-session endpoint'i yok, direkt payments endpoint'i kullanılıyor
      return await api.post('payments/', paymentData);
    } catch (error) {
      console.error('Ödeme oturumu oluşturma hatası:', error);
      throw error;
    }
  },
  
  // Sipariş durumunu kontrol et
  checkOrderStatus: async (orderId) => {
    try {
      return await api.get(`orders/${orderId}/status/`);
    } catch (error) {
      console.error('Sipariş durumu kontrol hatası:', error);
      throw error;
    }
  },
  
  // Kargo ücretini hesapla
  calculateShipping: async (addressId, cartItems) => {
    try {
      return await api.post('shipping/calculate/', {
        address_id: addressId,
        items: cartItems
      });
    } catch (error) {
      console.error('Kargo hesaplama hatası:', error);
      throw error;
    }
  }
};

export default CartService; 