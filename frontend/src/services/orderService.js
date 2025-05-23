import api from './api';

// Sipariş servisi
const OrderService = {
  // Sipariş oluştur
  createOrder: async (orderData) => {
    try {
      console.log('API isteği gönderiliyor:', orderData);
      const response = await api.post('orders/', orderData);
      console.log('API yanıtı:', response);
      return response;
    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      
      // Hata detaylarını daha iyi görmek için
      if (error.response) {
        console.error('Hata yanıtı:', error.response.data);
        console.error('Hata durumu:', error.response.status);
        console.error('Hata başlıkları:', error.response.headers);
      } else if (error.request) {
        console.error('İstek hatası (yanıt alınamadı):', error.request);
      } else {
        console.error('İstek kurulum hatası:', error.message);
      }
      
      throw error;
    }
  },
  
  // Siparişleri listele
  getOrders: async (params = {}) => {
    try {
      // Query parametrelerini oluştur
      const queryParams = new URLSearchParams();
      
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      }
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `orders/?${queryString}` : 'orders/';
      
      return await api.get(endpoint);
    } catch (error) {
      console.error('Sipariş listesi alınamadı:', error);
      throw error;
    }
  },
  
  // Sipariş detayını getir
  getOrderDetail: async (orderId) => {
    try {
      return await api.get(`orders/${orderId}/`);
    } catch (error) {
      console.error('Sipariş detayı alınamadı:', error);
      throw error;
    }
  },
  
  // Ödeme işlemi başlat
  initiatePayment: async (orderId, paymentData) => {
    try {
      return await api.post(`orders/${orderId}/payment/`, paymentData);
    } catch (error) {
      console.error('Ödeme başlatma hatası:', error);
      throw error;
    }
  },
  
  // Ödeme durumunu kontrol et
  checkPaymentStatus: async (orderId) => {
    try {
      return await api.get(`orders/${orderId}/payment/status/`);
    } catch (error) {
      console.error('Ödeme durumu kontrol hatası:', error);
      throw error;
    }
  },
  
  // Sipariş iptal et
  cancelOrder: async (orderId, reason) => {
    try {
      return await api.post(`orders/${orderId}/cancel_order/`, { reason });
    } catch (error) {
      console.error('Sipariş iptal hatası:', error);
      throw error;
    }
  },
  
  // Teslimat bilgisi al
  getTrackingInfo: async (orderId) => {
    try {
      return await api.get(`orders/${orderId}/tracking/`);
    } catch (error) {
      console.error('Teslimat bilgisi alınamadı:', error);
      throw error;
    }
  },
  
  // Sipariş için fatura oluştur
  generateInvoice: async (orderId) => {
    try {
      return await api.get(`orders/${orderId}/invoice/`);
    } catch (error) {
      console.error('Fatura oluşturma hatası:', error);
      throw error;
    }
  }
};

export default OrderService; 