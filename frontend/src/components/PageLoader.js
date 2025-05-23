"use client";

import React from 'react';
import Image from 'next/image';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8 animate-pulse">
          <Image
            src="/images/kasarcim-logo.svg"
            alt="Kaşarcım"
            width={180}
            height={60}
            className="mx-auto"
          />
        </div>
        
        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Loading Text */}
        <p className="mt-4 text-gray-600 text-sm">Yükleniyor...</p>
      </div>
    </div>
  );
} 