"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaUser, FaSave, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaMapMarkerAlt, FaShoppingBag, FaLock, FaEdit, FaCog, FaEnvelope, FaKey } from 'react-icons/fa';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUserProfile, authLoading, loading, isAuthenticated } = useAuth();
  const router = useRouter();
   
  const [formValues, setFormValues] = useState({
    email: '',
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  // Not: Aktif tab özelliği kaldırıldı
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);
  
  // Kullanıcı bilgilerini form state'ine yükle
  useEffect(() => {
    if (user) {
      setFormValues({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);
  
  // Bildirim mesajını belirli süre sonra kaldır
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };
  
  // Avatar için kullanılacak ad-soyad baş harfleri
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    } else if (user?.firstName) {
      return user.firstName.charAt(0);
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'K';
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formValues.firstName || !formValues.lastName || !formValues.email) {
      setNotification({
        type: 'error',
        message: 'Ad, soyad ve e-posta alanları zorunludur.'
      });
      return;
    }
    
    // E-posta doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email)) {
      setNotification({
        type: 'error',
        message: 'Geçerli bir e-posta adresi girin.'
      });
      return;
    }
    
    // Şifre değişikliği kontrolleri
    if (formValues.newPassword) {
      if (formValues.newPassword !== formValues.confirmPassword) {
        setNotification({
          type: 'error',
          message: 'Yeni şifre ve şifre onayı eşleşmiyor.'
        });
        return;
      }
      
      if (!formValues.currentPassword) {
        setNotification({
          type: 'error',
          message: 'Mevcut şifrenizi girmelisiniz.'
        });
        return;
      }
      
      if (formValues.newPassword.length < 8) {
        setNotification({
          type: 'error',
          message: 'Şifre en az 8 karakter uzunluğunda olmalıdır.'
        });
        return;
      }
    }
    
    // Kullanıcı bilgilerini güncelle
    const userData = {
      email: formValues.email,
      first_name: formValues.firstName,
      last_name: formValues.lastName,
    };
    
    // Şifre değişikliği varsa ekle
    if (formValues.newPassword && formValues.currentPassword) {
      userData.current_password = formValues.currentPassword;
      userData.new_password = formValues.newPassword;
    }
    
    try {
      const success = await updateUserProfile(userData);
      
      if (success) {
        // Şifre alanlarını temizle
        setFormValues({
          ...formValues,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Profil güncellenirken bir hata oluştu.'
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center p-8 rounded-lg bg-white shadow-lg">
          <FaSpinner className="animate-spin text-orange-500 h-12 w-12 mb-4" />
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64">
          <div className="bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md p-6 sticky top-24">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl mb-3 shadow-md">
                  {getInitials()}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
              </div>
            </div>
            
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Hesap Menüsü</h3>
            <nav className="space-y-1">
              <div className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center bg-orange-50 text-orange-700 border-l-4 border-orange-500">
                <FaUser className="mr-3 h-4 w-4" />
                Profil Bilgilerim
              </div>
              
              <Link 
                href="/adreslerim" 
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <FaMapMarkerAlt className="mr-3 h-4 w-4" />
                Adreslerim
              </Link>
              
              <Link 
                href="/siparisler" 
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <FaShoppingBag className="mr-3 h-4 w-4" />
                Siparişlerim
              </Link>
              
              <div className="pt-4 mt-4 border-t border-gray-100">
                <a
                  href="#sifre-degistir"
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <FaLock className="mr-3 h-4 w-4" />
                  Şifre Değiştir
                </a>
              </div>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaUser className="mr-2 text-orange-500" /> 
                Profil Bilgilerim
              </h2>
              
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors duration-200"
                >
                  <FaEdit className="mr-1" /> Düzenle
                </button>
              )}
            </div>
            
            {/* Bildirim mesajı */}
            {notification.message && (
              <div className={`mb-6 p-4 rounded-lg ${
                notification.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-100' 
                  : 'bg-green-50 text-green-700 border border-green-100'
              } animate-fadeIn`}>
                <div className="flex items-center">
                  {notification.type === 'error' ? (
                    <FaExclamationTriangle className="mr-2 h-5 w-5 text-red-400 flex-shrink-0" />
                  ) : (
                    <FaCheckCircle className="mr-2 h-5 w-5 text-green-400 flex-shrink-0" />
                  )}
                  <span>{notification.message}</span>
                </div>
              </div>
            )}
            
            {!isEditing ? (
              // Profil bilgisi görüntüleme modu - modernleştirilmiş
              <div className="space-y-6 transition-all duration-300 animate-fadeIn">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-orange-50 rounded-lg p-5 border border-orange-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-orange-100 rounded-full mr-3">
                        <FaUser className="text-orange-600 h-4 w-4" />
                      </div>
                      <h3 className="text-md font-semibold text-gray-800">Kişisel Bilgiler</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Ad</p>
                        <p className="text-base font-medium text-gray-900">{formValues.firstName}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Soyad</p>
                        <p className="text-base font-medium text-gray-900">{formValues.lastName}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <FaEnvelope className="text-blue-600 h-4 w-4" />
                      </div>
                      <h3 className="text-md font-semibold text-gray-800">İletişim Bilgileri</h3>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">E-posta Adresi</p>
                      <p className="text-base font-medium text-gray-900">{formValues.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                  >
                    <FaEdit className="mr-2 h-4 w-4" />
                    Bilgilerimi Düzenle
                  </button>
                </div>
              </div>
            ) : (
              // Profil bilgisi düzenleme formu - modernleştirilmiş
              <form onSubmit={handleSubmit} className="space-y-6 transition-all duration-300 animate-fadeIn">
                {/* İletişim Bilgileri */}
                <div className="bg-gradient-to-r from-orange-50 to-white p-5 rounded-lg border border-orange-100 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-orange-100 pb-2">Profil Bilgileri</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ad */}
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Adınız <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formValues.firstName}
                        onChange={handleChange}
                        required
                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                        placeholder="Adınız"
                      />
                    </div>
                    
                    {/* Soyad */}
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Soyadınız <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formValues.lastName}
                        onChange={handleChange}
                        required
                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                        placeholder="Soyadınız"
                      />
                    </div>
                    
                    {/* E-posta */}
                    <div className="md:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta Adresi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formValues.email}
                        onChange={handleChange}
                        required
                        className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                        placeholder="ornek@mail.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                  >
                    İptal
                  </button>
                  
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {authLoading ? (
                      <>
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <FaSave className="-ml-1 mr-2 h-4 w-4" />
                        Değişiklikleri Kaydet
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Şifre değiştirme alanı - Her ekran boyutunda */}
          <div id="sifre-degistir" className="bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md p-6 block animate-fadeIn mt-6">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaLock className="mr-2 text-orange-500" /> 
                Şifre Değiştir
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-lg border border-blue-100 shadow-sm">
                <div className="mb-5">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <FaLock className="text-blue-600 h-4 w-4" />
                    </div>
                    <h3 className="text-md font-semibold text-gray-800">Mevcut Şifre</h3>
                  </div>
                  
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formValues.currentPassword}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                    placeholder="Mevcut şifrenizi girin"
                  />
                </div>
                
                <div className="h-px bg-blue-100 my-5"></div>
                
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <FaKey className="text-green-600 h-4 w-4" />
                  </div>
                  <h3 className="text-md font-semibold text-gray-800">Yeni Şifre</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formValues.newPassword}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                      minLength="8"
                      placeholder="Minimum 8 karakter"
                    />
                    <p className="mt-1 text-xs text-gray-500">En az 8 karakter olmalıdır</p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formValues.confirmPassword}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                      placeholder="Şifrenizi tekrar girin"
                    />
                  </div>
                </div>
              </div>
              
              {/* Kaydet butonu */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200"
                >
                  {authLoading ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <FaSave className="-ml-1 mr-2 h-4 w-4" />
                      Şifreyi Güncelle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 