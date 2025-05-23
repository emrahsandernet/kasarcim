"use client";

import React from 'react';
import Link from 'next/link';
import { useLoader } from '@/context/LoaderContext';

export default function CustomLink({ children, href, onClick, ...props }) {
  const { showLoader } = useLoader();

  const handleClick = (e) => {
    // Aynı sayfaya gidiyorsak loader gösterme
    if (window.location.pathname === href) {
      return;
    }

    // Hash linkler için loader gösterme
    if (href.startsWith('#')) {
      return;
    }

    // External linkler için loader gösterme
    if (href.startsWith('http') || href.startsWith('//')) {
      return;
    }

    // Loader'ı göster
    showLoader();

    // Eğer custom onClick varsa onu da çağır
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
} 