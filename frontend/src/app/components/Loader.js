import React from 'react';

const Loader = ({ size = 'medium' }) => {
  // Size değerleri için sınıf isimleri
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };
  
  // Seçilen boyut veya varsayılan olarak medium
  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClass} animate-spin rounded-full border-4 border-gray-200 border-t-orange-500`}></div>
      <p className="mt-4 text-gray-600 text-center">Yükleniyor...</p>
    </div>
  );
};

export default Loader; 