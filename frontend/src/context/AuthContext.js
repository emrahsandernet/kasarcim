"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import Toast from '@/components/Toast';
import { AuthService, UserService } from '@/services';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Sayfa yüklendiğinde localStorage'dan token ve kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          // Token varsa yükle
          setToken(storedToken);
          
          // Oturum kontrolü
          const checkAuth = async () => {
            const token = localStorage.getItem('token');
           
            
            if (token) {
              try {
                const data = await AuthService.getCurrentUser();
                
                // API yanıtını incele
             
                
                // Kullanıcı ID kontrolü
                if (!data.id) {
                  console.error("API'den gelen kullanıcı verisinde ID bulunamadı!");
                }
                
                // Kullanıcı nesnesini oluştur
                const userObject = {
                  id: data.id,
                  username: data.username,
                  email: data.email,
                  firstName: data.first_name || '',
                  lastName: data.last_name || '',
                  isStaff: data.is_staff || false,
                };
                
              
                
                setUser(userObject);
                setIsAuthenticated(true);
              } catch (error) {
                console.error('Kullanıcı bilgileri alınamadı:', error);
                
                // API'ye ulaşılamıyorsa localStorage'dan kullanıcı bilgisini kullan
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                  setUser(JSON.parse(storedUser));
                  setIsAuthenticated(true);
                } else {
                  // Token geçersiz veya süresi doldu
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setUser(null);
                  setIsAuthenticated(false);
                }
              }
            } else {
              setUser(null);
              setIsAuthenticated(false);
            }
            
            setLoading(false);
          };
          
          await checkAuth();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Kimlik bilgileri yüklenirken hata oluştu:', error);
        // Hata durumunda temizlik yap
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    
    loadAuth();
  }, []);
  
  // Login işlemi
  const login = async (email, password) => {
    setAuthLoading(true);
    
    try {
      const data = await AuthService.login(email, password);
      
      // Kullanıcı nesnesini oluştur
      const userObject = {
        id: data.user_id,
        username: data.username,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        isStaff: data.is_staff,
      };
      
      // State'i güncelle
      setToken(data.token);
      setUser(userObject);
      setIsAuthenticated(true);
      
      Toast.success('Başarıyla giriş yapıldı');
      return true;
    } catch (error) {
      
     
      Toast.error('E-posta veya şifreyi hatalı girdiniz!');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Kayıt işlemi
  const register = async (userData) => {
    setAuthLoading(true);
    
    try {
      const data = await AuthService.register(userData);
      
      // Kullanıcı nesnesini oluştur ve state'i güncelle
      if (data.token) {
        const userObject = {
          id: data.id,
          username: data.username,
          email: data.email,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          isStaff: false,
        };
        
        setToken(data.token);
        setUser(userObject);
        setIsAuthenticated(true);
      }
      
      Toast.success('Hesap başarıyla oluşturuldu');
      return true;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      
      // Hata mesajını ayıkla
      let errorMessage = 'Kayıt yapılamadı';
      if (error.data) {
        errorMessage = Object.values(error.data).flat().join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.error(errorMessage);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Kullanıcı çıkışı
  const logout = async () => {
    setAuthLoading(true);
    
    try {
      await AuthService.logout();
      
      // State'i temizle
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      Toast.success('Başarıyla çıkış yapıldı');
      return true;
    } catch (error) {
      console.error('Çıkış hatası:', error);
      // Hata olsa bile çıkış yapılmış sayılır
      
      // State'i temizle
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      Toast.error('Çıkış yapılırken bir sorun oluştu');
      return true;
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Şifre sıfırlama isteği
  const requestPasswordReset = async (email) => {
    setAuthLoading(true);
    
    try {
      await AuthService.requestPasswordReset(email);
      
      Toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
      return true;
    } catch (error) {
      console.error('Şifre sıfırlama isteği hatası:', error);
      
      // Hata mesajını ayıkla
      let errorMessage = 'Şifre sıfırlama isteği gönderilemedi';
      if (error.data && error.data.email) {
        errorMessage = error.data.email[0];
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.error(errorMessage);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Şifre sıfırlama onayı
  const confirmPasswordReset = async (token, password, password2) => {
    setAuthLoading(true);
    
    try {
      await AuthService.confirmPasswordReset(token, password, password2);
      
      Toast.success('Şifreniz başarıyla değiştirildi');
      return true;
    } catch (error) {
      console.error('Şifre sıfırlama onay hatası:', error);
      
      // Hata mesajını ayıkla
      let errorMessage = 'Şifre sıfırlama işlemi başarısız';
      if (error.data) {
        if (error.data.token) {
          errorMessage = error.data.token[0];
        } else if (error.data.password) {
          errorMessage = error.data.password[0];
        } else if (error.data.non_field_errors) {
          errorMessage = error.data.non_field_errors[0];
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.error(errorMessage);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Kullanıcı profili güncelleme
  const updateUserProfile = async (userData) => {
    setAuthLoading(true);
    
    try {
      if (!token) {
        throw new Error('Oturum açmanız gerekiyor');
      }
      
      // UserService'i kullanarak profil güncelleme işlemini yap
      const response = await UserService.updateProfile(userData);
      
      // Kullanıcı nesnesini güncelle
      const updatedUser = {
        ...user,
        username: response.username || user.username,
        email: response.email || user.email,
        firstName: response.first_name || user.firstName,
        lastName: response.last_name || user.lastName,
      };
      
      // State'i güncelle
      setUser(updatedUser);
      
      Toast.success('Profil başarıyla güncellendi');
      return true;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Toast.error(error.message || 'Profil güncellenirken bir hata oluştu');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      authLoading,
      isAuthenticated,
      login,
      register,
      logout,
      requestPasswordReset,
      confirmPasswordReset,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 