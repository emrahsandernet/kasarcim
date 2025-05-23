import axios from 'axios';
import { API_URL } from './api';


// Blog API'lerine erişimi yönetecek servis
const blogService = {
  // Tüm blog yazılarını getir (sayfalama ve filtreleme desteği ile)
  getAllPosts: async (page = 1, filters = {}) => {
    try {
      let url = `${API_URL}/blog/posts/?page=${page}`;
      
      // Filtreleri URL'ye ekle
      if (filters.category) url += `&categories__slug=${filters.category}`;
      if (filters.tag) url += `&tags__slug=${filters.tag}`;
      if (filters.search) url += `&search=${filters.search}`;
      if (filters.ordering) url += `&ordering=${filters.ordering}`;
      if (filters.page_size) url += `&page_size=${filters.page_size}`;
      

      const response = await axios.get(url);
      
      // API yanıtını kontrol et
      // DRF'nin sayfalama yanıtı { count, next, previous, results } formatında olmalı
      // Eğer yanıt bir dizi ise, sayfalama etkin değil demektir
      if (Array.isArray(response.data)) {
       
        
        // Sayfalama formatına uyarla
        const formattedResponse = {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
        
      
        return formattedResponse;
      }
      
      // Normal sayfalama formatı kontrolü
      if (!response.data || !response.data.results) {
        console.error('API yanıtında beklenen data.results yapısı bulunamadı:', response.data);
        return { results: [] };
      }
      
      // Dönen veriyi kontrol edelim
      const postsCount = response.data.results.length;
    
      // Ek kontrol: Her bir blog yazısında gerekli alanların olup olmadığını kontrol et
      if (postsCount > 0) {
        // İlk yazıda id kontrolü yap
        if (!response.data.results[0].id) {
          console.warn('Blog yazılarında ID alanı eksik olabilir!');
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Blog yazıları alınırken hata oluştu:', error);
      // Hata durumunda bile tutarlı bir veri yapısı döndür
      return { results: [] };
    }
  },
  
  // Tek bir blog yazısını slug ile getir
  getPostBySlug: async (slug) => {
    try {
      const response = await axios.get(`${API_URL}/blog/posts/${slug}/`);
      return response.data;
    } catch (error) {
      console.error(`${slug} sluglı blog yazısı alınırken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Blog kategorilerini getir
  getCategories: async () => {
    try {
      const response = await axios.get(`${API_URL}/blog/categories/`);
      return response.data;
    } catch (error) {
      console.error('Blog kategorileri alınırken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir kategorideki blog yazılarını getir
  getPostsByCategory: async (categorySlug, page = 1) => {
    try {
      const response = await axios.get(`${API_URL}/blog/categories/${categorySlug}/blogs/?page=${page}`);
      return response.data;
    } catch (error) {
      console.error(`${categorySlug} kategorisindeki blog yazıları alınırken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Blog etiketlerini getir
  getTags: async () => {
    try {
      const response = await axios.get(`${API_URL}/blog/tags/`);
      return response.data;
    } catch (error) {
      console.error('Blog etiketleri alınırken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir etiketli blog yazılarını getir
  getPostsByTag: async (tagSlug, page = 1) => {
    try {
      const response = await axios.get(`${API_URL}/blog/tags/${tagSlug}/blogs/?page=${page}`);
      return response.data;
    } catch (error) {
      console.error(`${tagSlug} etiketli blog yazıları alınırken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Öne çıkan blog yazılarını getir
  getFeaturedPosts: async () => {
    try {
      console.log('getFeaturedPosts API isteği yapılıyor');
      const response = await axios.get(`${API_URL}/blog/posts/featured/`);
      
      // API yanıtını kontrol edelim
      if (!response.data) {
        console.error('Öne çıkan yazılar için API yanıtı alınamadı');
        return [];
      }
      
      // featured API endpoint'i bir dizi dönüyor (sayfalama yok)
      if (!Array.isArray(response.data)) {
        console.error('Öne çıkan yazılar için API yanıtı beklenen dizi formatında değil:', response.data);
        return [];
      }
      
      console.log(`getFeaturedPosts API yanıtı: ${response.data.length} öne çıkan yazı alındı.`);
      
      // Eğer veri geliyorsa ilk öğeyi kontrol et
      if (response.data.length > 0) {
        const firstItem = response.data[0];
        if (!firstItem.id) {
          console.warn('Öne çıkan yazıda ID alanı eksik olabilir!', firstItem);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Öne çıkan blog yazıları alınırken hata oluştu:', error);
      // Hata durumunda bile tutarlı bir veri yapısı döndür
      return [];
    }
  },
  
  // Tek bir öne çıkan blog yazısını getir
  getSingleFeaturedPost: async () => {
    try {
      console.log('getSingleFeaturedPost API isteği yapılıyor');
      const response = await axios.get(`${API_URL}/blog/posts/single_featured/`);
      
      // API yanıtını kontrol edelim
      if (!response.data) {
        console.error('Tek öne çıkan yazı için API yanıtı alınamadı');
        return null;
      }
      
      console.log('getSingleFeaturedPost API yanıtı:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Tek öne çıkan blog yazısı alınırken hata oluştu:', error);
      // Hata durumunda null döndür
      return null;
    }
  },
  
  // En popüler blog yazılarını getir
  getPopularPosts: async () => {
    try {
      const response = await axios.get(`${API_URL}/blog/posts/popular/`);
      
      // popular API endpoint'i bir dizi dönüyor (sayfalama yok)
      if (!Array.isArray(response.data)) {
        console.warn('Popüler yazılar için API yanıtı beklenen dizi formatında değil, dönüştürülüyor');
        return Array.isArray(response.data.results) ? response.data.results : [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Popüler blog yazıları alınırken hata oluştu:', error);
      return [];
    }
  },
  
  // Blog arşivini al (ay bazında)
  getArchive: async () => {
    try {
      const response = await axios.get(`${API_URL}/blog/posts/archive/`);
      return response.data;
    } catch (error) {
      console.error('Blog arşivi alınırken hata oluştu:', error);
      throw error;
    }
  }
};

export default blogService; 