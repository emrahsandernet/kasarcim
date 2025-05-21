"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaUser, FaEdit, FaTrash, FaPlus, FaSpinner, FaSave, FaStar, FaMapMarkerAlt, FaShoppingBag, FaCog } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { UserService, api } from '@/services';
import { Suspense } from 'react';

function AddressesContent() {
  const { user, authLoading, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    city: '',
    district: '',
    state: '',
    postal_code: '',
    is_default: false
  });
  
  // Client-side rendering için
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir

  
  // Adresleri yükle
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user) return;
      
      try {
        const addresses = await UserService.getAddresses();
        setAddresses(addresses);
        setLoading(false);
      } catch (error) {
        console.error('Adres listesi yüklenirken hata:', error);
        toast.error('Adresler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };
    
    if (mounted && user) {
      loadAddresses();
    }
  }, [mounted, user]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Zorunlu alanların kontrolü
    if (!formData.title || !formData.address || !formData.city || !formData.phone_number || !formData.district) {
      toast.error('Lütfen zorunlu alanları doldurun (Başlık, Telefon, Adres, İl ve İlçe)');
      return;
    }
    
    setProcessing(true);
    
    try {
      // Backend'e gönderilecek veriyi hazırla - state alanını district alanına map et
      const submitData = {
        ...formData,
        district: formData.district || formData.state, // Geriye dönük uyumluluk için
      };
      
      if (editingAddress) {
        // Mevcut adresi güncelle
        await UserService.updateAddress(editingAddress.id, submitData);
        toast.success('Adres başarıyla güncellendi');
      } else {
        // Yeni adres ekle
        await UserService.addAddress(submitData);
        toast.success('Yeni adres başarıyla eklendi');
      }
      
      // Adres listesini yenile
      const updatedAddresses = await UserService.getAddresses();
      setAddresses(updatedAddresses);
      
      // Formu sıfırla ve kapat
      resetForm();
      
      // Sayfayı yukarı kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Varsa geri dönüş URL'sine yönlendir
      if (returnUrl) {
        router.push(returnUrl);
      }
    } catch (error) {
      console.error('Adres kaydedilirken hata:', error);
      
      // Hata mesajını daha detaylı gösterelim
      let errorMessage = 'Adres kaydedilirken bir hata oluştu';
      
      if (error.data) {
        // API hata formatını işle
        const errorData = error.data;
        const errorDetails = [];
        
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            errorDetails.push(`${field}: ${messages.join(', ')}`);
          } else {
            errorDetails.push(`${field}: ${messages}`);
          }
        }
        
        if (errorDetails.length > 0) {
          errorMessage = `Hata: ${errorDetails.join('; ')}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleEdit = (address) => {
    // Düzenleme sırasında district ve state alanlarını doğru şekilde map et
    setFormData({
      title: address.title || '',
      first_name: address.first_name || '',
      last_name: address.last_name || '',
      phone_number: address.phone_number || '',
      address: address.address || '',
      city: address.city || '',
      district: address.district || '',
      state: address.state || address.district || '', // Geriye dönük uyumluluk için
      postal_code: address.postal_code || '',
      is_default: address.is_default || false
    });
    
    setEditingAddress(address);
    setFormVisible(true);
    
    // Sayfayı form alanına kaydır
    setTimeout(() => {
      document.getElementById('addressForm').scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleDelete = async (addressId) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;
    
    try {
      // Önce kullanıcı için adres API'sinden silme işlemi yapalım
      try {
        await UserService.deleteAddress(addressId);
      } catch (serviceError) {
        console.error('Servis ile adres silme hatası:', serviceError);
        
        // Servis başarısız olursa doğrudan API çağrısı deneyelim
        const response = await fetch(`http://localhost:8000/api/addresses/${addressId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        if (!response.ok) {
          // API yanıtı başarısız ise hata fırlat
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.error || 'Adres silme işlemi başarısız oldu');
        }
      }
      
      // UI'ı güncelle - adres başarıyla silindiyse
      setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== addressId));
      toast.success('Adres başarıyla silindi');
    } catch (error) {
      console.error('Adres silinirken hata:', error);
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Adres silinirken bir hata oluştu';
      if (error.data && error.data.detail) {
        errorMessage = error.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };
  
  const setAsDefault = async (address) => {
    if (address.is_default) return;
    
    try {
      // Adres ID'sini ve update verilerini gönder
      await UserService.updateAddress(address.id, { ...address, is_default: true });
      
      // Adres listesini güncelle
      const updatedAddresses = await UserService.getAddresses();
      setAddresses(updatedAddresses);
      
      toast.success(`${address.title} varsayılan adres olarak ayarlandı`);
    } catch (error) {
      console.error('Varsayılan adres ayarlanırken hata:', error);
      toast.error('Varsayılan adres ayarlanırken bir hata oluştu');
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      address: '',
      city: '',
      district: '',
      state: '',
      postal_code: '',
      is_default: false
    });
    setEditingAddress(null);
    setFormVisible(false);
  };
  
  if (!mounted || authLoading || !user) {
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
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'K'}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
              </div>
            </div>
            
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Hesap Menüsü</h3>
            <nav className="space-y-1">
              <Link 
                href="/profilim" 
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <FaUser className="mr-3 h-4 w-4" />
                Profil Bilgilerim
              </Link>
              
              <Link 
                href="/adreslerim" 
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all duration-200 bg-orange-50 text-orange-700 border-l-4 border-orange-500"
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
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-orange-500" /> 
                Adreslerim
              </h2>
              
              {!formVisible && (
                <button 
                  onClick={() => {
                    resetForm();
                    setFormVisible(true);
                    // Form görünür olduktan sonra forma odaklan
                    setTimeout(() => {
                      document.getElementById('addressForm').scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                >
                  <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                  Yeni Adres Ekle
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-orange-500 h-8 w-8" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-12 text-center">
                <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">Henüz hiç adresiniz bulunmuyor.</p>
                              <button 
                onClick={() => {
                  resetForm();
                  setFormVisible(true);
                  // Form görünür olduktan sonra forma odaklan
                  setTimeout(() => {
                    document.getElementById('addressForm').scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              >
                  <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                  Yeni Adres Ekle
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Adres listesi */}
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow hover:border-orange-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{address.title}</h3>
                          {address.is_default && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 mb-1">
                          {address.first_name} {address.last_name} - {address.phone_number}
                        </div>
                        <div className="text-sm text-gray-700 mb-1">
                          {address.address}
                        </div>
                        <div className="text-sm text-gray-700">
                          {address.city}, {address.district}, {address.postal_code}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!address.is_default && (
                          <button 
                            onClick={() => setAsDefault(address)}
                            className="text-green-600 hover:text-green-700 border border-green-200 hover:border-green-300 rounded-lg p-1.5 transition-all duration-200"
                            title="Varsayılan yap"
                          >
                            <FaStar className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(address)}
                          className="text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg p-1.5 transition-all duration-200"
                          title="Düzenle"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(address.id)}
                          className="text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg p-1.5 transition-all duration-200"
                          title="Sil"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Adres formu */}
      {formVisible && (
        <div id="addressForm" className="bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md p-6 mb-8 mt-6">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              {editingAddress ? (
                <>
                  <FaEdit className="mr-2 text-orange-500" />
                  Adresi Düzenle
                </>
              ) : (
                <>
                  <FaPlus className="mr-2 text-orange-500" />
                  Yeni Adres Ekle
                </>
              )}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Adres başlığı ve varsayılan ayarı */}
            <div className="bg-gradient-to-r from-orange-50 to-white p-5 rounded-lg border border-orange-100 shadow-sm mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-full mr-3">
                  <FaHome className="text-orange-600 h-4 w-4" />
                </div>
                <h3 className="text-md font-semibold text-gray-800">Adres Bilgileri</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Adres Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                    placeholder="Örn: Ev, İş"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <div className="relative flex items-start mt-6">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="is_default"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleChange}
                        className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="is_default" className="font-medium text-gray-700">
                        Bu adresi varsayılan olarak kaydet
                      </label>
                   
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Kişi bilgileri */}
            <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-lg border border-blue-100 shadow-sm mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <FaUser className="text-blue-600 h-4 w-4" />
                </div>
                <h3 className="text-md font-semibold text-gray-800">Kişi Bilgileri</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Ad
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                    placeholder="Adınız"
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                    placeholder="Soyadınız"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">+90</span>
                    </div>
                    <input
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="pl-12 shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                      placeholder="5XX XXX XX XX"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Adres detayları */}
            <div className="bg-gradient-to-r from-green-50 to-white p-5 rounded-lg border border-green-100 shadow-sm mb-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <FaMapMarkerAlt className="text-green-600 h-4 w-4" />
                </div>
                <h3 className="text-md font-semibold text-gray-800">Adres Detayları</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Açık Adres <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                    placeholder="Mahalle, Sokak, Apartman ve Daire No gibi detayları girin"
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      İl <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                      placeholder="Örn: İstanbul"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                      İlçe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                      placeholder="Örn: Kadıköy"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                      Posta Kodu
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border bg-white transition-all duration-200"
                      placeholder="Örn: 34000"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Butonlar */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center px-4 py-3 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200 hover:scale-105"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    İşleniyor...
                  </>
                ) : editingAddress ? (
                  <>
                    <FaSave className="-ml-1 mr-2 h-4 w-4" />
                    Güncelle
                  </>
                ) : (
                  <>
                    <FaSave className="-ml-1 mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Ana bileşeni Suspense ile sarıyoruz
export default function AddressesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-orange-500 h-8 w-8" />
      </div>
    }>
      <AddressesContent />
    </Suspense>
  );
} 