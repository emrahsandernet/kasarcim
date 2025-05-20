"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { api,API_URL } from '@/services';

export default function ProductRating({ product, slug, onRatingChange }) {
  const { user, isAuthenticated, token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [hasUserPurchasedProduct, setHasUserPurchasedProduct] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hasUserRated, setHasUserRated] = useState(false);
  const [loadingUserRating, setLoadingUserRating] = useState(false);

  // Kullanıcının bu ürüne verdiği puanı yükle
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserRating();
      checkIfUserPurchasedProduct();
    }
  }, [isAuthenticated, token, slug, product]);

  const fetchUserRating = async () => {
    setLoadingUserRating(true);
    try {
      // api servisiyle kullanıcının verdiği puanı getir
      const data = await api.get(`products/${slug}/ratings/`);
      
      const userRatingObj = data.find(r => r.user.id === user.id);
      
      if (userRatingObj) {
        setRating(userRatingObj.rating);
        setUserRating(userRatingObj.rating);
        setHasUserRated(true);
        
        // Kullanıcı puanını localStorage'a kaydet
        localStorage.setItem(`product_${slug}_rating`, userRatingObj.rating);
        localStorage.setItem(`product_${slug}_hasRated`, 'true');
      } else {
        // localStorage'dan varsa yükle
        const savedRating = localStorage.getItem(`product_${slug}_rating`);
        const savedHasRated = localStorage.getItem(`product_${slug}_hasRated`);
        
        if (savedRating && savedHasRated === 'true') {
          setRating(parseInt(savedRating));
          setUserRating(parseInt(savedRating));
          setHasUserRated(true);
        }
      }
    } catch (error) {
      console.error('Kullanıcı puanı yüklenemedi:', error);
      
      // Hata durumunda localStorage'dan yükle
      const savedRating = localStorage.getItem(`product_${slug}_rating`);
      const savedHasRated = localStorage.getItem(`product_${slug}_hasRated`);
      
      if (savedRating && savedHasRated === 'true') {
        setRating(parseInt(savedRating));
        setUserRating(parseInt(savedRating));
        setHasUserRated(true);
      }
    } finally {
      setLoadingUserRating(false);
    }
  };
  
  const checkIfUserPurchasedProduct = async () => {
    try {
      // api servisiyle kullanıcının ürünü satın alıp almadığını kontrol et
      // OPTIONS metodu için özel bir çağrı yapıyoruz
      const response = await fetch(`${API_URL}/products/${slug}/add_rating/`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      // 200 OK alınırsa, kullanıcı ürünü satın almıştır
      setHasUserPurchasedProduct(response.ok);
    } catch (error) {
      console.error('Satın alma durumu kontrolü hatası:', error);
      setHasUserPurchasedProduct(false);
    }
  };

  const handleRating = async (selectedRating) => {
    if (!isAuthenticated) {
      toast.error('Puan vermek için giriş yapmalısınız');
      return;
    }
    
    if (!hasUserPurchasedProduct) {
      toast.error('Bu ürüne puan vermek için satın almış olmalısınız');
      return;
    }
    
    // Aynı puanı tekrar seçerse, işlemi iptal et
    if (userRating === selectedRating) {
      return;
    }
    
    setSubmittingRating(true);
    try {
      // api servisiyle kullanıcının puanını gönder
      await api.post(`products/${slug}/add_rating/`, { rating: selectedRating });
      
      // toast.success('Puanınız başarıyla kaydedildi');
      setRating(selectedRating);
      setUserRating(selectedRating);
      setHasUserRated(true);
      
      // Kullanıcı puanını localStorage'a kaydet
      localStorage.setItem(`product_${slug}_rating`, selectedRating);
      localStorage.setItem(`product_${slug}_hasRated`, 'true');
      
      // Parent bileşene puan değişikliğini bildir
      if (onRatingChange) {
        onRatingChange();
      }
    } catch (error) {
      console.error('Puan kaydetme hatası:', error);
      
      let errorMessage = 'Puanınız kaydedilirken bir hata oluştu';
      if (error.data && error.data.detail) {
        errorMessage = error.data.detail;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 mb-1">
          {hasUserRated ? 'Ürünü puanladınız:' : 'Bu ürünü puanlayın:'}
        </h4>
        <div className={`flex items-center ${isAuthenticated ? 'gap-2' : ''}`}>
          {loadingUserRating ? (
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          ) : (
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="relative cursor-pointer">
                  <FaStar
                    className={`text-2xl transition-all duration-150 ${
                      (hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                    } ${isAuthenticated && hasUserPurchasedProduct && !hasUserRated ? 'hover:scale-110' : ''}`}
                    onClick={isAuthenticated && hasUserPurchasedProduct && !hasUserRated ? () => handleRating(star) : undefined}
                    onMouseEnter={isAuthenticated && hasUserPurchasedProduct && !hasUserRated ? () => setHover(star) : undefined}
                    onMouseLeave={isAuthenticated && hasUserPurchasedProduct && !hasUserRated ? () => setHover(0) : undefined}
                    style={{ 
                      opacity: submittingRating ? 0.5 : 1
                    }}
                  />
                  {submittingRating && rating === star && (
                    <span className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-orange-500 animate-ping"></span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {isAuthenticated && hasUserPurchasedProduct && (
            <span className="ml-2 font-medium text-gray-700">
              {hasUserRated 
                ? `${rating}/5` 
                : hover ? `${hover}/5` : ''}
            </span>
          )}
        </div>
        
        {!isAuthenticated && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
            Puan vermek için <a href="/login" className="text-blue-600 font-semibold hover:underline">giriş yapın</a>
          </div>
        )}
        
        {isAuthenticated && !hasUserPurchasedProduct && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
            Puan vermek için ürünü satın almalısınız
          </div>
        )}
        
        {isAuthenticated && hasUserPurchasedProduct && hasUserRated && (
          <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700 flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Puanınız başarıyla kaydedildi
          </div>
        )}
      </div>
    </div>
  );
} 