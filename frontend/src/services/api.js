// API için temel yapılandırma dosyası
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:90/api';

// Temel fetch işlemi için yardımcı fonksiyon
export const fetchAPI = async (endpoint, options = {}) => {
  // Token varsa header'a ekle
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  const fullUrl = `${API_URL}/${endpoint}`;

  try {
    const response = await fetch(fullUrl, config);
    
    // DELETE istekleri için boş yanıt durumunu kontrol et
    let data = {};
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        // Boş yanıt veya geçersiz JSON durumunda
        console.warn('API yanıtı JSON olarak ayrıştırılamadı:', error);
      }
    }
    
    if (!response.ok) {
      // API hatası durumunda
      let errorMessage = data.error || data.detail || `API işlemi başarısız (${response.status})`;
      if (endpoint === 'coupons/apply/' ) {
        errorMessage = "Kupon kodu geçersiz.";
      }
      
      const error = new Error(errorMessage);
      error.response = { 
        status: response.status,
        data: data,
        headers: Object.fromEntries([...response.headers])
      };
      
      throw error;
    }
    
    return data;
  } catch (error) {
    // Network hatası durumunda
    if (!error.response) {
      console.error('Network hatası:', error.message);
      error.isNetworkError = true;
    }
    throw error;
  }
};

// HTTP metodları için yardımcı fonksiyonlar
export const api = {
  get: (endpoint, options = {}) => 
    fetchAPI(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint, data, options = {}) => 
    fetchAPI(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    
  put: (endpoint, data, options = {}) => 
    fetchAPI(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    
  patch: (endpoint, data, options = {}) => 
    fetchAPI(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
    
  delete: (endpoint, options = {}) => 
    fetchAPI(endpoint, { ...options, method: 'DELETE' })
};

export default api; 