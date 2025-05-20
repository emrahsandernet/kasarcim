"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/Toast';

// Şifre sıfırlama içeriği komponenti
function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: '',
    password2: '',
  });
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmPasswordReset, authLoading } = useAuth();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      Toast.error('Geçersiz şifre sıfırlama bağlantısı');
      router.push('/sifremi-unuttum');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Şifre gücünü kontrol et
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
    
    // Şifre eşleşmesini kontrol et
    if (name === 'password2' && formData.password !== value) {
      setErrors(prev => ({ ...prev, password2: 'Şifreler eşleşmiyor' }));
    } else if (name === 'password' && formData.password2 && value !== formData.password2) {
      setErrors(prev => ({ ...prev, password2: 'Şifreler eşleşmiyor' }));
    } else if (name === 'password2' || name === 'password') {
      setErrors(prev => ({ ...prev, password2: '' }));
    }
    
    // Hata mesajlarını temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
    
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Daha güçlü bir şifre oluşturun (büyük/küçük harf, rakam, özel karakter)';
    }
    
    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const resetSuccess = await confirmPasswordReset(
      token, 
      formData.password, 
      formData.password2
    );
    
    if (resetSuccess) {
      setSuccess(true);
      
      // Kullanıcıyı 3 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Şifre Sıfırlama
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Lütfen yeni şifrenizi belirleyin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="rounded-full bg-green-100 mx-auto w-16 h-16 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Şifre başarıyla değiştirildi</h3>
              <p className="mt-2 text-sm text-gray-500">
                Şifreniz başarıyla sıfırlandı. Birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Giriş sayfasına git
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Yeni şifre <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
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
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                  Şifre tekrar <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="password2"
                    name="password2"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password2}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password2 ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                  />
                  {errors.password2 && (
                    <p className="mt-2 text-sm text-red-600">{errors.password2}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {authLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      İşleniyor...
                    </span>
                  ) : 'Şifremi Sıfırla'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Ana sayfa bileşeni
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
} 