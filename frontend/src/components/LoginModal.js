"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    confirmPassword: '',
  });
  const { login, register, authLoading } = useAuth();
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Modal açıldığında body scrolling'i engelle
  useEffect(() => {
    // Body'e overflow: hidden ekleyerek scrolling'i engelle
    document.body.style.overflow = 'hidden';
    
    // Component unmount olduğunda (modal kapandığında) temizleme işlemi
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Şifre gücünü kontrol et
    if (name === 'password' && !isLogin) {
      calculatePasswordStrength(value);
    }
    
    // Temizle hata mesajını
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Blur event handler ekliyoruz
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Şifre eşleşmesi kontrolü sadece blur eventinde yapılacak
    if (!isLogin && name === 'confirmPassword' && formData.password) {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Şifreler eşleşmiyor' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
    
    // Şifre alanından çıkıldığında ve confirmPassword alanı doldurulmuşsa kontrol et
    if (!isLogin && name === 'password' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Şifreler eşleşmiyor' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    // Uzunluk kontrolü
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Karakter çeşitliliği
    if (/[A-Z]/.test(password)) strength += 1; // Büyük harf
    if (/[a-z]/.test(password)) strength += 1; // Küçük harf
    if (/[0-9]/.test(password)) strength += 1; // Rakam
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Özel karakter
    
    setPasswordStrength(strength);
  };
  
  const getStrengthText = () => {
    if (passwordStrength === 0) return 'Çok zayıf';
    if (passwordStrength <= 2) return 'Zayıf';
    if (passwordStrength <= 4) return 'Orta';
    if (passwordStrength <= 5) return 'Güçlü';
    return 'Çok güçlü';
  };
  
  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 4) return 'bg-yellow-500';
    if (passwordStrength <= 5) return 'bg-green-500';
    return 'bg-green-600';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // E-posta kontrolü - hem login hem de register için gerekli
    if (!formData.email) {
      newErrors.email = 'E-posta gerekli';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    // Şifre kontrolü
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (!isLogin) {
      if (formData.password.length < 8) {
        newErrors.password = 'Şifre en az 8 karakter olmalıdır';
      } else if (passwordStrength < 3) {
        newErrors.password = 'Daha güçlü bir şifre oluşturun';
      }
    }
    
    if (!isLogin) {
      // İsim ve soyisim kontrolü
      if (!formData.firstName) {
        newErrors.firstName = 'Ad gerekli';
      }
      
      if (!formData.lastName) {
        newErrors.lastName = 'Soyad gerekli';
      }
      
      // Şifre eşleşme kontrolü - form submit edilirken mutlaka kontrol edilmeli
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      }
      
      // Telefon numarası kontrolü - opsiyonel
      if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
        newErrors.phoneNumber = 'Geçerli bir telefon numarası girin';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isLogin) {
      const success = await login(formData.email, formData.password);
      if (success) {
        onClose();
      }
    } else {
      // Kayıt verilerini hazırla
      const userData = {
        password: formData.password,
        password2: formData.confirmPassword,
        email: formData.email,
      };
      
      // Opsiyonel alanları ekle
      if (formData.firstName.trim()) {
        userData.first_name = formData.firstName.trim();
      }
      
      if (formData.lastName.trim()) {
        userData.last_name = formData.lastName.trim();
      }
      
      if (formData.phoneNumber.trim()) {
        userData.phone_number = formData.phoneNumber.trim();
      }
      
      const success = await register(userData);
      
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        {/* Arka plan overlay */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal içeriği */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative z-50"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Kapat</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700">
                      E-posta <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                        id="modal-email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                        className={`appearance-none block w-full px-3 py-2 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                    </div>
                  </div>
                  
                  {!isLogin && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="modal-firstName" className="block text-sm font-medium text-gray-700">
                            Ad <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                          <input
                            type="text"
                            name="firstName"
                              id="modal-firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                              required
                              className={`appearance-none block w-full px-3 py-2 bg-white border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                          />
                            {errors.firstName && (
                              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="modal-lastName" className="block text-sm font-medium text-gray-700">
                            Soyad <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1">
                          <input
                            type="text"
                            name="lastName"
                              id="modal-lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                              required
                              className={`appearance-none block w-full px-3 py-2 bg-white border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                          />
                            {errors.lastName && (
                              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="modal-phoneNumber" className="block text-sm font-medium text-gray-700">
                          Telefon
                        </label>
                        <div className="mt-1 relative flex items-stretch border border-gray-300 rounded-md overflow-hidden focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                          <div className="flex items-center justify-center px-3 bg-gray-50 border-r border-gray-300">
                            <span className="text-gray-500 text-sm font-medium">+90</span>
                          </div>
                          <input
                            type="tel"
                            name="phoneNumber"
                            id="modal-phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="block w-full py-2 px-3 border-none focus:outline-none focus:ring-0 text-sm"
                            placeholder="5XX XXX XX XX"
                          />
                        </div>
                          {errors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                          )}
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700">
                      Şifre <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                    <input
                      type="password"
                      name="password"
                        id="modal-password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                        className={`appearance-none block w-full px-3 py-2 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                    />
                    {!isLogin && formData.password && (
                      <div className="mt-2">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getStrengthColor()}`} 
                            style={{ width: `${(passwordStrength / 6) * 100}%` }}
                          ></div>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Şifre güvenliği: <span className="font-medium">{getStrengthText()}</span>
                        </p>
                      </div>
                    )}
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                    </div>
                  </div>
                  
                  {!isLogin && (
                    <div>
                      <label htmlFor="modal-confirmPassword" className="block text-sm font-medium text-gray-700">
                        Şifre (Tekrar) <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                      <input
                        type="password"
                        name="confirmPassword"
                          id="modal-confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                          className={`appearance-none block w-full px-3 py-2 bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                      )}
                      </div>
                    </div>
                  )}
                  
                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="modal-remember"
                          name="remember_me"
                          type="checkbox"
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="modal-remember" className="ml-2 block text-sm text-gray-900">
                          Beni hatırla
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {!isLogin && (
                    <div className="flex items-center">
                      <input
                        id="modal-terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="modal-terms" className="ml-2 block text-sm text-gray-500">
                        <span>
                          <Link href="/kullanim-kosullari" onClick={onClose} className="font-medium text-orange-500 hover:text-orange-700">
                            Şartlar ve koşulları
                          </Link>{' '}
                          kabul ediyorum
                        </span>
                      </label>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setErrors({});
                      }}
                      className="text-orange-500 hover:text-orange-700 text-sm underline"
                    >
                      {isLogin ? 'Hesap oluştur' : 'Zaten hesabım var'}
                    </button>
                    
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      {authLoading ? 'İşleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                    </button>
                  </div>
                  
                  {isLogin && (
                    <div className="text-center mt-2">
                      <Link 
                        href="/sifremi-unuttum" 
                        onClick={onClose}
                        className="text-sm text-orange-500 hover:text-orange-700"
                      >
                        Şifremi unuttum
                      </Link>
                    </div>
                  )}
                  
                  {!isLogin && (
                    <div className="text-center text-xs text-gray-500 mt-4">
                      <p><span className="text-red-500">*</span> işaretli alanlar zorunludur</p>
                    </div>
                  )}
                </form>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Detaylı işlem için <Link href={isLogin ? "/login" : "/register"} onClick={onClose} className="text-orange-500 hover:text-orange-700">sayfayı ziyaret edin</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 