"use client";

import React from 'react';

export default function Loader({ size = "default" }) {
  // Size sınıflarını belirle
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    default: "w-8 h-8 border-4",
    large: "w-12 h-12 border-4"
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.default;
  
  return (
    <div className="flex items-center justify-center">
      <div className={`${spinnerSize} border-t-orange-500 border-orange-200 rounded-full animate-spin`}></div>
      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
} 