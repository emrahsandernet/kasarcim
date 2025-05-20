import toast from 'react-hot-toast';

// Toast mesajlarını özelleştirmek için yardımcı fonksiyonlar
const Toast = {
  // Başarı mesajı
  success: (message) => {
    return toast.success(message, {
      id: `success-${Date.now()}`,
      duration: 3500,
      style: {
        background: 'linear-gradient(to right, #FFF7ED, #FFF8F1)',
        borderLeft: '5px solid #FF6B00', // turuncu vurgu
        boxShadow: '0 10px 20px rgba(255, 107, 0, 0.15)',
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '420px',
        fontSize: '0.925rem',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
      },
      iconTheme: {
        primary: '#FF6B00', // Ana turuncu
        secondary: '#FFFFFF',
      },
    });
  },
  
  // Hata mesajı
  error: (message) => {
    return toast.error(message, {
      id: `error-${Date.now()}`,
      duration: 4000,
      style: {
        background: 'linear-gradient(to right, #FEF2F2, #FFF1F1)',
        borderLeft: '5px solid #EF4444', // kırmızı vurgu
        boxShadow: '0 10px 20px rgba(239, 68, 68, 0.15)',
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '420px',
        fontSize: '0.925rem',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
      },
      iconTheme: {
        primary: '#EF4444',
        secondary: '#FFFFFF',
      },
    });
  },
  
  // Bilgi mesajı
  info: (message) => {
    return toast(message, {
      id: `info-${Date.now()}`,
      duration: 3500,
      icon: '📢',
      style: {
        background: 'linear-gradient(to right, #F0F9FF, #EFF6FF)',
        borderLeft: '5px solid #3B82F6',
        boxShadow: '0 10px 20px rgba(59, 130, 246, 0.15)',
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '420px',
        fontSize: '0.925rem',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
      },
    });
  },
  
  // Uyarı mesajı
  warning: (message) => {
    return toast(message, {
      id: `warning-${Date.now()}`,
      duration: 4000,
      icon: '⚠️',
      style: {
        background: 'linear-gradient(to right, #FFFBEB, #FEF9C3)',
        color: '#854D0E',
        borderLeft: '5px solid #F59E0B',
        boxShadow: '0 10px 20px rgba(245, 158, 11, 0.15)',
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '420px',
        fontSize: '0.925rem',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
      },
    });
  },
  
  // Yükleniyor mesajı
  loading: (message = 'Yükleniyor...') => {
    return toast.loading(message, {
      id: `loading-${Date.now()}`,
      style: {
        background: 'linear-gradient(to right, #FFF7ED, #FFF8F1)',
        borderLeft: '5px solid #FF8C55', // turuncu-400 vurgu
        boxShadow: '0 10px 20px rgba(255, 107, 0, 0.15)',
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '420px',
        fontSize: '0.925rem',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
      },
      iconTheme: {
        primary: '#FF8C55',
        secondary: '#FFFFFF',
      },
    });
  },
  
  // Özel mesaj
  custom: (message, options = {}) => {
    return toast(message, {
      id: `custom-${Date.now()}`,
      duration: 3500,
      style: {
        background: 'linear-gradient(to right, #FFF7ED, #FFF8F1)',
        borderLeft: '5px solid #FF6B00',
        boxShadow: '0 10px 20px rgba(255, 107, 0, 0.15)',
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '420px',
        fontSize: '0.925rem',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
      },
      ...options,
    });
  },
  
  // Toast mesajını kapat
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
  
  // Tüm toast mesajlarını kapat
  dismissAll: () => {
    toast.dismiss();
  }
};

export default Toast; 