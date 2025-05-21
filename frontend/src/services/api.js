// API için temel yapılandırma dosyası
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';



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
  
  const response = await fetch(`${API_URL}/${endpoint}`, config);

  
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
  console.log(endpoint)
  
  if (!response.ok) {
    // API hatası durumunda
    const error = new Error(data.error || data.detail || `API işlemi başarısız (${response.status})`);
    error.data = data;
    error.status = response.status;
    console.log(endpoint)
    if (endpoint == "login") {
      // Login hatalarını özelleştir
      if (response.status === 400) {
        error.message = "E-posta adresi veya şifre hatalı. Lütfen tekrar deneyin.";
      } else if (response.status === 404) {
        error.message = "Hesap bulunamadı. Lütfen e-posta adresinizi kontrol edin.";
      } else if (response.status === 401) {
        error.message = "Oturum açma işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.";
      }
    }
    throw error;
  }
  
  return data;
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