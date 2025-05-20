"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaStar, FaUserCircle, FaThumbsUp, FaThumbsDown, FaStore, FaChevronLeft, FaChevronRight, FaEdit, FaInfoCircle, FaCheck } from 'react-icons/fa';
import Toast from '@/components/Toast';
import { api,API_URL } from '@/services';

export default function ProductReviews({ product, slug, onReviewChange, userHasReviewed: initialUserHasReviewed }) {
  const { user, isAuthenticated, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [allReviewsCount, setAllReviewsCount] = useState(0); // Toplam yorum sayısı
  const [hasUserPurchasedProduct, setHasUserPurchasedProduct] = useState(false);
  const [userReview, setUserReview] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(initialUserHasReviewed || false);
  const [userReviewId, setUserReviewId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null); // Genişletilmiş yorum izlemek için
  const [hoveredReview, setHoveredReview] = useState(null); // Fare ile üzerine gelinen yorum
  const [loadingLike, setLoadingLike] = useState(null); // Beğeni için loading durumu
  const [loadingDislike, setLoadingDislike] = useState(null); // Beğenmeme için loading durumu
  const [userInteractions, setUserInteractions] = useState({}); // Kullanıcının etkileşim yaptığı yorumlar {reviewId: 'like'|'dislike'}
  const scrollContainerRef = useRef(null);
  const reviewCardsRefs = useRef({}); // Yorum kartlarının ref'lerini tutacak
  
  // Pagination için değişkenler
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // Scroll işlevi
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.scrollWidth / reviews.length;
      
      // Sayfada değişiklik yap
      if (direction === 'right' && nextPageUrl) {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
        loadMoreReviews();
      } else if (direction === 'left' && prevPageUrl) {
        setCurrentPage(prev => Math.max(prev - 1, 1));
        // Önceki sayfaya gitme fonksiyonu eklenebilir
        // Bu değişiklik kapsamında şu an sadece ileri gitme desteği ekliyoruz
      }
    }
  };
  
  // Daha fazla yorum yükle
  const loadMoreReviews = async () => {
    if (nextPageUrl && !loadingMore) {
      fetchReviews(false);
    }
  };

  // Yorumları yükle
  useEffect(() => {
    fetchReviews(true);
  }, [slug]);

  // Kullanıcının ürünü satın alıp almadığını kontrol et
  useEffect(() => {
    if (isAuthenticated && token) {
      checkIfUserPurchasedProduct();
    }
  }, [isAuthenticated, token, slug]);

  // Parent'tan gelen userHasReviewed değişikliklerini izle
  useEffect(() => {
    if (initialUserHasReviewed !== undefined) {
      setHasUserReviewed(initialUserHasReviewed);
    } else if (isAuthenticated && token) {
      // has-reviewed endpoint'ini kullanarak kullanıcının yorum yapıp yapmadığını kontrol et
      checkIfUserHasReviewed();
    }
  }, [initialUserHasReviewed, isAuthenticated, token, slug]);

  // Kullanıcının etkileşimlerini localStorage'dan al
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const savedInteractions = localStorage.getItem('reviewInteractions');
        if (savedInteractions) {
          setUserInteractions(JSON.parse(savedInteractions));
        }
      } catch (error) {
        console.error('Etkileşimler yüklenirken hata:', error);
      }
    }
  }, [isAuthenticated]);

  // Kullanıcı etkileşimlerini kaydet
  const saveUserInteraction = (reviewId, type) => {
    const newInteractions = { ...userInteractions, [reviewId]: type };
    setUserInteractions(newInteractions);
    localStorage.setItem('reviewInteractions', JSON.stringify(newInteractions));
  };

  // Kullanıcı yoruma daha önce etkileşim yapmış mı?
  const hasUserInteracted = (reviewId) => {
    return userInteractions[reviewId] ? true : false;
  };

  // Kullanıcının bu ürüne yorum yapıp yapmadığını kontrol et
  const checkIfUserHasReviewed = async () => {
    try {
      const data = await api.get(`products/${slug}/has-reviewed/`);
      setHasUserReviewed(data.has_reviewed || false);
      
      // Eğer kullanıcı yorum yapmışsa, yorumunu al
      if (data.has_reviewed && data.review) {
        setUserReview(data.review.review || '');
        setUserReviewId(data.review.id);
      }
    } catch (error) {
      console.error('Yorum kontrolü sırasında hata oluştu:', error);
    }
  };

  const fetchReviews = async (reset = false) => {
    if (reset) {
      setLoadingReviews(true);
      setCurrentPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      // Yeni feedback endpoint'ini ve pagination parametrelerini kullan
      const url = reset 
        ? `products/${slug}/feedback/` 
        : nextPageUrl.replace(`${API_URL}/`, '');
        
      if (!url) {
        setLoadingMore(false);
        return;
      }

      const data = await api.get(url);
      
      // Pagination verilerini ayarla
      setNextPageUrl(data.next);
      setPrevPageUrl(data.previous);
      setAllReviewsCount(data.count);
      
      // Toplam sayfa sayısını hesapla (her sayfada 10 kayıt)
      setTotalPages(Math.ceil(data.count / 10));
      
      // Yorumları ayarla
      if (reset) {
        setReviews(data.results);
      } else {
        setReviews(prev => [...prev, ...data.results]);
      }
      
      // Kullanıcı giriş yapmışsa kendi yorumunu bul
      if (isAuthenticated && user) {
        const userReviewObj = data.results.find(review => review.user.id === user.id);
        if (userReviewObj) {
          setUserReview(userReviewObj.review);
          setHasUserReviewed(true);
          setUserReviewId(userReviewObj.id);
        } else if (reset) {
          // Eğer ilk sayfada kullanıcının yorumu yoksa...
          setHasUserReviewed(false);
          setUserReview('');
        }
      }
    } catch (error) {
      console.error('Yorum yükleme hatası:', error);
    } finally {
      if (reset) {
        setLoadingReviews(false);
      } else {
        setLoadingMore(false);
      }
    }
  };
  
  // Metni belirli bir uzunluğa göre kırpar
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Yorum genişletme/daraltma
  const toggleExpandReview = (reviewId) => {
    console.log("Tıklama algılandı:", reviewId);
    if (expandedReview === reviewId) {
      setExpandedReview(null);
      } else {
      setExpandedReview(reviewId);
    }
  };

  const checkIfUserPurchasedProduct = async () => {
    try {
      // OPTIONS metodu için özel bir çağrı yapıyoruz
      const response = await fetch(`${API_URL}/products/${slug}/add_review/`, {
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
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userReview.trim()) {
      Toast.error('Lütfen bir yorum yazın');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await api.post(`products/${slug}/add_review/`, { review: userReview });
      
      Toast.success('Yorumunuz başarıyla eklendi');
      fetchReviews(true); // Yorumları yeniden yükle
      setShowReviewForm(false);
      
      // Parent bileşene yorum değişikliğini bildir
      if (onReviewChange) {
        onReviewChange();
      }
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
      
      // Hata mesajını göster
      let errorMessage = 'Yorum eklenirken bir hata oluştu';
      if (error.data && error.data.detail) {
        errorMessage = error.data.detail;
      }
      
      Toast.error(errorMessage);
      
      // Kullanıcı daha önce yorum yapmışsa hasUserReviewed'ı true yap
      if (error.data && error.data.detail && error.data.detail.includes("zaten bir yorum")) {
        setHasUserReviewed(true);
        fetchReviews(true); // Mevcut yorumları yeniden yükle
      }
    } finally {
      setSubmittingReview(false);
    }
  };
  
  // Formatlanmış kullanıcı adı gösterir
  const displayUsername = (userObj) => {
    if (userObj.id === user?.id) {
      return "Siz";
    }
    
    const maskedName = userObj.masked_first_name || userObj.masked_username || '**';
    const maskedLastName = userObj.masked_last_name || '';
    
    return `${maskedName} ${maskedLastName}`.trim();
  };
  
  // Tarih formatlama
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(date)} ${date.getFullYear()}`;
  };

  // Beğen/Beğenme işlemleri
  const handleLikeReview = async (reviewId) => {
    if (!isAuthenticated || !token) {
      Toast.warning('Beğeni işlemi için giriş yapmalısınız');
      return;
    }

    // Kullanıcı daha önce etkileşim yaptıysa işlem yapma
    if (hasUserInteracted(reviewId)) {
      Toast.warning('Bu yorumu daha önce değerlendirdiniz');
      return;
    }

    setLoadingLike(reviewId);
    
    // reviewId'den sayısal kısmı çıkar (örn: "review-1" -> "1")
    const numericId = reviewId.replace('review-', '');

    try {
      const data = await api.post(`reviews/${numericId}/like/`);

      // Sadece ilgili yorumu güncelle, tümünü yeniden yükleme
      setReviews(prevReviews => 
        prevReviews.map(review => 
          `review-${review.id}` === reviewId ? { ...review, like: data.likes || review.like + 1 } : review
        )
      );
      
      // Kullanıcının etkileşimini kaydet
      saveUserInteraction(reviewId, 'like');
      
      Toast.success('Yorumu beğendiniz');
    } catch (error) {
      console.error('Beğeni işlemi hatası:', error);
      
      let errorMessage = 'Beğeni işlemi sırasında bir hata oluştu';
      if (error.data && error.data.detail) {
        errorMessage = error.data.detail;
      }
      
      Toast.error(errorMessage);
    } finally {
      setLoadingLike(null);
    }
  };

  const handleDislikeReview = async (reviewId) => {
    if (!isAuthenticated || !token) {
      Toast.warning('Beğenmeme işlemi için giriş yapmalısınız');
      return;
    }

    // Kullanıcı daha önce etkileşim yaptıysa işlem yapma
    if (hasUserInteracted(reviewId)) {
      Toast.warning('Bu yorumu daha önce değerlendirdiniz');
      return;
    }

    setLoadingDislike(reviewId);
    
    // reviewId'den sayısal kısmı çıkar (örn: "review-1" -> "1")
    const numericId = reviewId.replace('review-', '');

    try {
      const data = await api.post(`reviews/${numericId}/dislike/`);

      // Sadece ilgili yorumu güncelle, tümünü yeniden yükleme
      setReviews(prevReviews => 
        prevReviews.map(review => 
          `review-${review.id}` === reviewId ? { ...review, dislike: data.dislikes || review.dislike + 1 } : review
        )
      );
      
      // Kullanıcının etkileşimini kaydet
      saveUserInteraction(reviewId, 'dislike');
      
      Toast.success('Yorumu beğenmediniz');
    } catch (error) {
      console.error('Beğenmeme işlemi hatası:', error);
      
      let errorMessage = 'Beğenmeme işlemi sırasında bir hata oluştu';
      if (error.data && error.data.detail) {
        errorMessage = error.data.detail;
      }
      
      Toast.error(errorMessage);
    } finally {
      setLoadingDislike(null);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6 relative inline-block">
        Müşteri Yorumları ({allReviewsCount})
        <span className="absolute bottom-0 left-0 w-1/4 h-1 bg-orange-500 rounded-full"></span>
      </h2>
      
      {/* Yorum Formu - Sadece giriş yapmış, ürünü satın almış ve daha önce yorum yapmamış kullanıcılara gösterilir */}
      {isAuthenticated ? (
        hasUserPurchasedProduct ? (
          hasUserReviewed ? (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-4 rounded-lg mb-8 text-sm text-green-800 flex items-center">
              <FaCheck className="mr-2 text-green-600" />
              <p>Bu ürüne zaten bir yorum yaptınız. Yorumunuzu aşağıda görebilirsiniz.</p>
            </div>
          ) : null
          ) : (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-4 rounded-lg mb-8 text-sm text-yellow-800">
            <p>Bu ürüne yorum yapabilmek için satın almış ve siparişinizi tamamlamış olmalısınız.</p>
          </div>
        )
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-lg mb-8 text-sm">
          <p>Yorum yapabilmek için <a href="/login" className="text-blue-600 font-semibold hover:underline">giriş yapmanız</a> gerekiyor.</p>
        </div>
      )}
      
      {/* Yorum Formu - Kullanıcı giriş yapmış, ürünü satın almış ve yorum yapmamışsa gösterilir */}
      {isAuthenticated && hasUserPurchasedProduct && !hasUserReviewed && !initialUserHasReviewed && (
        <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl mb-8 shadow-sm border border-gray-100 transition-all duration-500 animate-fadeIn">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Ürün Hakkında Görüşünüzü Paylaşın</h3>
            <p className="text-sm text-gray-600">Satın aldığınız bu ürün hakkında deneyimlerinizi diğer müşterilerle paylaşarak onlara yardımcı olabilirsiniz.</p>
          </div>
              <form onSubmit={handleReviewSubmit}>
                <textarea 
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px] shadow-sm"
                  placeholder="Bu ürün hakkında düşüncelerinizi paylaşın..."
                  required
                />
                <button 
                  type="submit"
                  disabled={submittingReview}
              className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-6 rounded-md font-medium inline-flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  {submittingReview ? 'Gönderiliyor...' : 'Yorumu Gönder'}
              <span className="ml-1">→</span>
                </button>
              </form>
        </div>
      )}
      
      {/* Yorumlar Listesi - Yatay Kaydırmalı */}
      {loadingReviews ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Yorumlar yükleniyor...</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="relative px-8">
          {/* Kaydırma Butonları */}
          <button 
            onClick={() => handleScroll('left')} 
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none hidden md:flex items-center justify-center transition-transform hover:scale-110 ${prevPageUrl ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!prevPageUrl}
          >
            <FaChevronLeft className="text-orange-500" />
          </button>
          
          <button 
            onClick={() => handleScroll('right')} 
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none hidden md:flex items-center justify-center transition-transform hover:scale-110 ${nextPageUrl ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!nextPageUrl}
          >
            <FaChevronRight className="text-orange-500" />
          </button>
          
          {/* Yatay Kaydırmalı Konteyner */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide space-x-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={(e) => {
              // Kullanıcı sağa kaydırırken sonuna yaklaştığında daha fazla yorum yükle
              const container = e.currentTarget;
              if (
                container.scrollWidth - container.scrollLeft <= container.clientWidth * 1.2 &&
                !loadingMore && 
                nextPageUrl
              ) {
                loadMoreReviews();
              }
            }}
          >
            {reviews.map((review, index) => {
              const isLongReview = review.review.length > 100;
              const truncatedReview = truncateText(review.review, 100);
              const reviewId = `review-${review.id}`;
              
              return (
              <div 
                key={`${review.id}-${index}`} 
                  ref={el => reviewCardsRefs.current[reviewId] = el}
                  className={`review-card flex-none snap-start w-full md:w-[360px] h-[220px] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 relative
                             ${review.user.id === user?.id 
                               ? 'bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200' 
                               : 'bg-white border border-gray-200'}`}
              >
                {/* Yorum Başlık Kısmı */}
                  <div className={`border-b p-4 ${review.user.id === user?.id ? 'border-orange-100' : 'border-gray-100'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center mb-2 sm:mb-0">
                      {/* User Icon */}
                        <div className={`rounded-full p-2 mr-2 ${review.user.id === user?.id ? 'bg-orange-100' : 'bg-gray-100'}`}>
                          <FaUserCircle className={`text-base ${review.user.id === user?.id ? 'text-orange-500' : 'text-gray-400'}`} />
                      </div>
                      
                      {/* User & Date */}
                      <div>
                          <span className={`font-medium block text-sm ${review.user.id === user?.id ? 'text-orange-700' : 'text-gray-700'}`}>
                          {displayUsername(review.user)}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Rating */}
                      <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                            className={`text-sm ${i < (review.user_rating || 4) ? "text-yellow-400" : "text-gray-300"} transform hover:scale-110 transition-transform`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Yorum İçerik Kısmı */}
                  <div className="p-4 flex flex-col justify-between h-[135px]">
                    <div>
                      <div className="relative">
                        <p className={`text-sm ${review.user.id === user?.id ? 'text-gray-800' : 'text-gray-700'} line-clamp-3`}>
                          {truncatedReview}
                  </p>
                        {isLongReview && (
                          <div 
                            className="absolute bottom-0 right-0 text-xs text-orange-500 font-medium flex items-center cursor-pointer"
                            onClick={() => toggleExpandReview(reviewId)}
                          >
                            Devamını oku <FaChevronRight className="ml-1 text-[10px]" />
                          </div>
                        )}
                      </div>
                  </div>
                  
                  {/* Product Link & Faydalı Butonları */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                    <span className="text-xs text-gray-500 flex items-center">
                      <FaStore className="inline-block mr-1" />
                        Kaşarcım
                    </span>
                    
                      <div className="flex items-center text-xs">
                        <button 
                          className={`flex items-center ${userInteractions[reviewId] === 'like' ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'} mr-3 transition-transform hover:scale-110 ${hasUserInteracted(reviewId) && userInteractions[reviewId] !== 'like' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleLikeReview(reviewId)}
                          disabled={loadingLike === reviewId || loadingDislike === reviewId || (hasUserInteracted(reviewId) && userInteractions[reviewId] !== 'like')}
                        >
                          {loadingLike === reviewId ? (
                            <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-1"></span>
                          ) : (
                            <FaThumbsUp className={`mr-1 ${userInteractions[reviewId] === 'like' ? 'text-orange-500' : ''}`} /> 
                          )}
                          <span>{review.like || 0}</span>
                      </button>
                        <button 
                          className={`flex items-center ${userInteractions[reviewId] === 'dislike' ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'} transition-transform hover:scale-110 ${hasUserInteracted(reviewId) && userInteractions[reviewId] !== 'dislike' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleDislikeReview(reviewId)}
                          disabled={loadingLike === reviewId || loadingDislike === reviewId || (hasUserInteracted(reviewId) && userInteractions[reviewId] !== 'dislike')}
                        >
                          {loadingDislike === reviewId ? (
                            <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-1"></span>
                          ) : (
                            <FaThumbsDown className={`mr-1 ${userInteractions[reviewId] === 'dislike' ? 'text-orange-500' : ''}`} /> 
                          )}
                          <span>{review.dislike || 0}</span>
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Loading Indicator */}
            {loadingMore && (
              <div className="flex-none snap-start w-full md:w-[360px] h-[220px] flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
              </div>
            )}
          </div>
          
          {/* Mobil için Pagination Dots */}
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 w-2 rounded-full ${(i + 1) === currentPage ? 'bg-orange-500' : 'bg-gray-300'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">Bu ürüne henüz yorum yapılmamış.</p>
          <p className="mt-2 text-sm text-orange-600 font-medium">İlk yorumu siz yapın!</p>
        </div>
      )}
      
      {/* Genişletilmiş Yorum Popup - Sabit pozisyon ve açıkça görünür */}
      {expandedReview && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setExpandedReview(null)}>
          <div 
            className="bg-white/95 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto border border-orange-200" 
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const reviewIdParts = expandedReview.split('-');
              const id = parseInt(reviewIdParts[1]);
              const review = reviews.find(r => r.id === id);
              
              if (!review) return null;
              
              return (
                <div>
                  {/* Yorum Popup Başlık */}
                  <div className={`border-b p-4 ${review.user.id === user?.id ? 'bg-orange-50' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`rounded-full p-2 mr-3 ${review.user.id === user?.id ? 'bg-orange-100' : 'bg-gray-100'}`}>
                          <FaUserCircle className={`text-lg ${review.user.id === user?.id ? 'text-orange-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {displayUsername(review.user)}
                          </h3>
                          <span className="text-gray-500 text-sm">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setExpandedReview(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Yorum İçeriği */}
                  <div className="p-5">
                    <div className="mb-4">
                      <p className="text-gray-800 whitespace-pre-line">
                        {review.review}
                      </p>
                    </div>
                    
                    {/* Yıldız Derecelendirmesi */}
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`${i < (review.user_rating || 4) ? "text-yellow-400" : "text-gray-300"} mr-1`} 
                        />
                      ))}
                    </div>
                    
                    {/* Beğenme Butonları */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FaStore className="mr-2" /> Kaşarcım
                      </span>
                      <div className="flex gap-5">
                        <button 
                          onClick={() => handleLikeReview(expandedReview)}
                          className={`flex items-center ${userInteractions[expandedReview] === 'like' ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`}
                          disabled={loadingLike === expandedReview || loadingDislike === expandedReview}
                        >
                          <FaThumbsUp className="mr-2" /> 
                          <span>{review.like || 0}</span>
                        </button>
                        <button 
                          onClick={() => handleDislikeReview(expandedReview)}
                          className={`flex items-center ${userInteractions[expandedReview] === 'dislike' ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`}
                          disabled={loadingLike === expandedReview || loadingDislike === expandedReview}
                        >
                          <FaThumbsDown className="mr-2" /> 
                          <span>{review.dislike || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Kaydırma çubuklarını gizle */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Metni belirli satır sayısıyla sınırla */
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
} 