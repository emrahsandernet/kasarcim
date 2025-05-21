"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaCartPlus, FaWeightHanging, FaEye, FaCheckCircle, FaLiraSign } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {

  
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // API'den gelen indirim bilgilerini kullan
  const hasDiscount = product.active_discount !== null && product.active_discount !== undefined;
  const discountRate = hasDiscount && product.active_discount?.discount_percentage ? product.active_discount.discount_percentage : 0;
  const originalPrice = product.price;
  const discountedPrice = hasDiscount && product.discounted_price !== null
    ? product.discounted_price
    : originalPrice;
  
  // Ürünün gramajını ve birim fiyatını hesapla
  const weight = product.weight || 0; // Gram cinsinden
  const pricePerKg = weight > 0 ? (discountedPrice / (weight / 1000)).toFixed(2) : 0;
  
  // Kısaltılmış açıklama metni (ilk 60 karakter)
  const shortDescription = product.description 
    ? product.description.length > 100 
      ? `${product.description.substring(0, 100)}...` 
      : product.description
    : '';
  
  // Gramaj formatını ayarla (500g, 1kg gibi)
  const formatWeight = (weightInGrams) => {
    if (!weightInGrams) return '';
    
    if (weightInGrams >= 1000) {
      return `${(weightInGrams / 1000).toLocaleString('tr-TR')} kg`;
    } else {
      return `${weightInGrams.toLocaleString('tr-TR')} g`;
    }
  };
  
  // Stok durumu
  const stockStatus = product.stock <= 5 && product.stock > 0 ? 'low' : 'in-stock';
  
  // Ürünün stokta olup olmadığını kontrol et (is_in_stock değeri yoksa manuel kontrol yap)
  const isInStock = product.is_in_stock !== undefined ? product.is_in_stock : (product.stock > 0);
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    
    // Sepete ekleme animasyonu
    setTimeout(() => {
      addToCart(product, 1);
      setIsAdding(false);
      setShowSuccess(true);
      
      // Başarı mesajını 2 saniye sonra kapat
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }, 500);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group relative h-[500px] flex flex-col">
      {/* Badge için container */}
      <div className="absolute top-3 left-3 z-10 space-y-2">
        {/* İndirim etiketi */}
        {hasDiscount && discountRate > 0 && (
          <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
            %{discountRate} İndirim
          </div>
        )}
        
        {/* Stok durumu */}
        {stockStatus === 'low' && (
          <div className="bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
            Son Ürünler
          </div>
        )}
      </div>
      
      <div className="relative overflow-hidden">
        <Link href={`/urunler/${product.slug}`}>
          <div className="aspect-square relative">
            <div className="relative w-full h-full">
              <Image src={product.img_url} alt={product.name} fill className="object-cover" priority/>
            </div>
            
            {/* Hover efekti */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center pointer-events-none">
              <div className="bg-white bg-opacity-80 rounded-full p-3 transform translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
                <FaEye className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>
        </Link>
        
        {/* Gramaj etiketi */}
        {weight > 0 && (
          <div className="absolute bottom-3 left-3 bg-orange-100 text-orange-800 text-xs px-3 py-1.5 rounded-full font-medium flex items-center shadow-sm">
            <FaWeightHanging className="mr-1.5 h-3 w-3" />
            {formatWeight(weight)}
          </div>
        )}
      </div>
      
      <div className="p-5 relative flex-1 flex flex-col">
        {/* Kategori linki */}
        <div className="mb-1">
          <Link 
            href={`/kategoriler/${product.category_slug || product.category?.slug}`} 
            className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-medium uppercase tracking-wide"
          >
            {product.category_name || product.category?.name}
          </Link>
        </div>
        
        <Link href={`/urunler/${product.slug}`} className="block group-hover:text-orange-500 transition-colors">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-2 min-h-[46px]">
            {product.name}
        
          </h3>
        </Link>
        
        {/* Kısa açıklama */}
        <p className="mt-2 text-sm text-gray-600 line-clamp-2 min-h-[80px] italic">
          {shortDescription}
        </p>
        
        {/* Fiyat bölümü */}
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center">
            {/* İndirimli ve normal fiyat */}
            {hasDiscount ? (
              <>
                <div className="font-bold text-2xl text-orange-600 mr-2 flex items-center">
                  <FaLiraSign className="h-4 w-4 mr-1 text-orange-600" />
                  {discountedPrice.toLocaleString('tr-TR',{
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
                <div className="text-sm text-gray-500 line-through flex items-center">
                  <FaLiraSign className="h-3 w-3 mr-0.5 text-gray-500" />
                  {originalPrice.toLocaleString('tr-TR',{
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </>
            ) : (
              <div className="font-bold text-2xl text-orange-600 flex items-center">
                <FaLiraSign className="h-4 w-4 mr-1 text-orange-600" />
                {originalPrice.toLocaleString('tr-TR',{
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            )}
            
            {/* Birim fiyat */}
            {weight > 0 && (
              <div className="text-gray-600 text-xs mt-1 w-full flex items-center">
                <FaLiraSign className="h-3 w-3 mr-0.5 text-gray-600" />
                {pricePerKg.toLocaleString('tr-TR')}/kg
              </div>
            )}
          </div>
        </div>
          
        {/* Sepete ekle butonu - sabit pozisyonlu */}
        <div 
          onClick={handleAddToCart}
          disabled={isAdding || !isInStock}
          className={`absolute bottom-5 right-5 rounded-full shadow-md transition-all duration-300
            ${isAdding || showSuccess ? 'w-12 h-12' : 'w-11 h-11'}
            ${showSuccess ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}
            ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''} 
            flex items-center justify-center`}
        >
          {isAdding ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : showSuccess ? (
            <FaCheckCircle className="h-5 w-5 text-white" />
          ) : (
            <FaCartPlus className="h-5 w-5 text-white" />
          )}
        </div>
      </div>
    </div>
  );
} 