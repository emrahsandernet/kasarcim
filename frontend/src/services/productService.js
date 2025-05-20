import api from './api';

// Ürün servisi
const ProductService = {
  // Ürün listesini getir
  getProducts: async (params = {}) => {
    try {
      // Query parametrelerini oluştur
      const queryParams = new URLSearchParams();
      
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      }
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `products/?${queryString}` : 'products/';
      
      return await api.get(endpoint,{
        cache: 'no-store',
      });
    } catch (error) {
      console.error('Ürün listesi alınamadı:', error);
      throw error;
    }
  },
  
  // Ürün detayını getir
  getProductDetail: async (productSlug) => {
    try {
      return await api.get(`products/by-slug/${productSlug}/`);
    } catch (error) {
      console.error('Ürün detayı alınamadı:', error);
      throw error;
    }
  },
  
  // Kategorileri getir
  getCategories: async () => {
    try {
      return await api.get('categories/');
    } catch (error) {
      console.error('Kategori listesi alınamadı:', error);
      throw error;
    }
  },
  
  // Kategori detayını getir
  getCategoryDetail: async (categoryId) => {
    try {
      return await api.get(`categories/${categoryId}/`);
    } catch (error) {
      console.error('Kategori detayı alınamadı:', error);
      throw error;
    }
  },
  
  // Ürün arama
  searchProducts: async (query) => {
    try {
      return await api.get(`products/search/?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Ürün araması yapılamadı:', error);
      throw error;
    }
  },
  
  // Popüler ürünleri getir
  getPopularProducts: async (limit = 10) => {
    try {
      return await api.get(`products/popular/?limit=${limit}`);
    } catch (error) {
      console.error('Popüler ürünler alınamadı:', error);
      throw error;
    }
  },
  
  // Yeni ürünleri getir
  getNewProducts: async (limit = 10) => {
    try {
      return await api.get(`products/new/?limit=${limit}`);
    } catch (error) {
      console.error('Yeni ürünler alınamadı:', error);
      throw error;
    }
  },
  
  // İndirimli ürünleri getir
  getDiscountedProducts: async (limit = 10) => {
    try {
      return await api.get(`products/discounted/?limit=${limit}`);
    } catch (error) {
      console.error('İndirimli ürünler alınamadı:', error);
      throw error;
    }
  }
};

export default ProductService; 