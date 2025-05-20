import api from './api';

// Kullanıcı hesabı ve profil servisi
const UserService = {
  // Kullanıcı profilini güncelle
  updateProfile: async (userData) => {
    try {
      // Kullanıcı kimliğini al
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum bilgileri bulunamadı');
      }
      
      // Veriyi backend'in beklediği formata dönüştür
      const modifiedUserData = {
        ...userData,
      };
      
      // camelCase'den snake_case'e dönüşüm için
      if (userData.firstName !== undefined) {
        modifiedUserData.first_name = userData.firstName;
        delete modifiedUserData.firstName;
      }
      
      if (userData.lastName !== undefined) {
        modifiedUserData.last_name = userData.lastName;
        delete modifiedUserData.lastName;
      }
      
      // Doğru endpoint'i kullanarak profil güncelleme 
      const data = await api.patch('users/current-user/', modifiedUserData);
      
      // Başarılı güncellemede localStorage'daki kullanıcı bilgilerini güncelle
      if (data) {
        const storedUser = localStorage.getItem('user');
        const userObject = storedUser ? JSON.parse(storedUser) : {};
        
        const updatedUser = {
          ...userObject,
          username: data.username || userObject.username,
          email: data.email || userObject.email,
          firstName: data.first_name || userObject.firstName,
          lastName: data.last_name || userObject.lastName
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return data;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      
      // Özel hata mesajları oluştur
      if (error.status === 403) {
        throw new Error('Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor');
      } else if (error.status === 401) {
        throw new Error('Oturum süreniz dolmuş olabilir, lütfen tekrar giriş yapın');
      } else if (error.data) {
        // API'den gelen hata mesajlarını topla
        const errorMessages = [];
        
        // Obje içindeki tüm hata mesajlarını düzgün bir şekilde ayıkla
        for (const field in error.data) {
          if (Array.isArray(error.data[field])) {
            errorMessages.push(`${field}: ${error.data[field].join(', ')}`);
          } else if (typeof error.data[field] === 'string') {
            errorMessages.push(`${field}: ${error.data[field]}`);
          } else if (typeof error.data[field] === 'object') {
            for (const subField in error.data[field]) {
              errorMessages.push(`${field} ${subField}: ${error.data[field][subField]}`);
            }
          }
        }
        
        // Hata mesajlarını birleştir
        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join('; '));
        }
      }
      
      // Genel hata mesajı
      throw new Error(error.message || 'Profil güncellenirken bir hata oluştu');
    }
  },
  
  // Kullanıcının adreslerini listele
  getAddresses: async () => {
    try {
      return await api.get('addresses/');
    } catch (error) {
      console.error('Adres listesi alınamadı:', error);
      throw error;
    }
  },
  
  // Yeni adres ekle
  addAddress: async (addressData) => {
    try {
      return await api.post('addresses/', addressData);
    } catch (error) {
      console.error('Adres ekleme hatası:', error);
      throw error;
    }
  },
  
  // Adres güncelle
  updateAddress: async (addressId, addressData) => {
    try {
      return await api.put(`addresses/${addressId}/`, addressData);
    } catch (error) {
      console.error('Adres güncelleme hatası:', error);
      throw error;
    }
  },
  
  // Adres sil
  deleteAddress: async (addressId) => {
    try {
      return await api.delete(`addresses/${addressId}/`);
    } catch (error) {
      console.error('Adres silme hatası:', error);
      throw error;
    }
  },
  
  // Kullanıcının siparişlerini listele
  getOrders: async () => {
    try {
      return await api.get('orders/');
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
  }
};

export default UserService; 