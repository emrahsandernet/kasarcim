"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register, authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Şifre eşleşme kontrolü için zamanlayıcı
  const [passwordMatchTimer, setPasswordMatchTimer] = useState(null);
  
  // Eğer kullanıcı zaten giriş yapmışsa, ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Şifre gücünü kontrol et
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
    
    // Şifre eşleşmesini kontrol et
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      // Önce varsa eski zamanlayıcıyı temizle
      if (passwordMatchTimer) {
        clearTimeout(passwordMatchTimer);
      }
      
      // Şifreler eşleşmiyorsa 1 saniye bekle ve sonra hatayı göster
      if ((name === 'password' && value !== formData.confirmPassword) || 
          (name === 'confirmPassword' && value !== formData.password)) {
        
        // Hata mesajını göstermeden önce hatayı temizle
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
        
        // 1 saniye sonra hatayı göster
        const timer = setTimeout(() => {
          setErrors(prev => ({ ...prev, confirmPassword: 'Şifreler eşleşmiyor' }));
        }, 1000);
        
        setPasswordMatchTimer(timer);
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
    
    // Temizle hata mesajını
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // component unmount olduğunda zamanlayıcıyı temizle
  useEffect(() => {
    return () => {
      if (passwordMatchTimer) {
        clearTimeout(passwordMatchTimer);
      }
    };
  }, [passwordMatchTimer]);
  
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
    
    // E-posta kontrolü
    if (!formData.email) {
      newErrors.email = 'E-posta gerekli';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    // Şifre kontrolü
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Daha güçlü bir şifre oluşturun (büyük/küçük harf, rakam, özel karakter)';
    }
    
    // Şifre eşleşme kontrolü
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    // Telefon numarası kontrolü
    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      newErrors.phoneNumber = 'Geçerli bir telefon numarası girin';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
      router.push('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Yeni hesap oluşturun
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Veya{' '}
          <Link href="/login" className="font-medium text-orange-500 hover:text-orange-400">
            mevcut hesabınıza giriş yapın
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Kullanıcı adınız e-posta adresinizden otomatik oluşturulacaktır</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Ad
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Soyad
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Telefon Numarası
              </label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="5xx xxx xx xx"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Başında 0 olmadan, 10 haneli olarak girin</p>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formData.password && (
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
                    <p className="mt-1 text-xs text-gray-500">
                      İyi bir şifre için büyük/küçük harf, rakam ve özel karakter kullanın.
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Şifre (Tekrar) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  <span>
                    <Link href="/kullanim-kosullari" className="font-medium text-orange-500 hover:text-orange-400">
                      Şartlar ve koşulları
                    </Link>{' '}
                    kabul ediyorum
                  </span>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {authLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </button>
            </div>
            
            <div className="text-center text-xs text-gray-500 mt-4">
              <p><span className="text-red-500">*</span> işaretli alanlar zorunludur</p>
              <p className="mt-1">Sadece e-posta ve şifre alanları zorunludur, diğer alanlar opsiyoneldir.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 