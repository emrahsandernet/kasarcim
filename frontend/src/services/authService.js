import api from './api';

// Kimlik doğrulama servisi
const AuthService = {
  // Kullanıcı girişi
  login: async (email, password) => {
    try {
      const data = await api.post('login/', { email, password });
      
   
      
      // Token ve kullanıcı bilgilerini localStorage'a kaydet
      if (data.token) {
        if (!data.user_id) {
          console.error('Uyarı: Login yanıtında user_id bulunamadı', data);
        }
        
        const userObject = {
          id: data.user_id,
          username: data.username,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          isStaff: data.is_staff,
        };
        
        
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userObject));
      }
      
      return data;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcı kaydı
  register: async (userData) => {
    try {
      // Telefon numarası varsa user_profile verisi oluştur
      const modifiedUserData = { ...userData };
      
      // Profil verilerini ayır
      if (userData.phone_number) {
        modifiedUserData.user_profile = {
          phone_number: userData.phone_number
        };
        // Ana objeden çıkar
        delete modifiedUserData.phone_number;
      }
      
      const data = await api.post('register/', modifiedUserData);
      
      // Otomatik giriş durumunda token ve kullanıcı bilgilerini localStorage'a kaydet
      if (data.token) {
        const userObject = {
          id: data.id,
          username: data.username,
          email: data.email,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          isStaff: false,
        };
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userObject));
      }
      
      return data;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcı çıkışı
  logout: async () => {
    try {
      // Çıkış API isteği (opsiyonel)
      await api.post('logout/').catch(() => {
        // Çıkış işlemi başarısız olsa bile devam et
       
      });
      
      // Her durumda localStorage'dan temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return true;
    } catch (error) {
      console.error('Çıkış hatası:', error);
      
      // API hatası olursa bile localStorage'dan temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return true;
    }
  },
  
  // Kullanıcı bilgilerini getir
  getCurrentUser: async () => {
    try {
      return await api.get('users/me/');
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      throw error;
    }
  },
  
  // Şifre sıfırlama isteği
  requestPasswordReset: async (email) => {
    try {
      return await api.post('password-reset/', { email });
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      throw error;
    }
  },
  
  // Şifre sıfırlama onayı
  confirmPasswordReset: async (token, password, password2) => {
    try {
      return await api.post('password-reset-confirm/', {
        token,
        password,
        password2
      });
    } catch (error) {
      console.error('Şifre sıfırlama onay hatası:', error);
      throw error;
    }
  }
};

export default AuthService; 