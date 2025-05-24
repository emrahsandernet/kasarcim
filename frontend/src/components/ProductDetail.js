"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCartPlus, FaStar, FaCheck, FaInfoCircle, FaShippingFast, FaRegCreditCard, FaShieldAlt, FaBolt, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import ProductRating from '@/components/ProductRating';
import ProductReviews from '@/components/ProductReviews';
import { ProductService, api } from '@/services';
import PageLoader from '@/components/PageLoader';
import toast from 'react-hot-toast';

export default function ProductDetail({ product: initialProduct, slug }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [refreshProduct, setRefreshProduct] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'
  const [product, setProduct] = useState(initialProduct);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [loading, setLoading] = useState(!initialProduct);
  // 👉 GA4 / GTM için view_item eventi gönder
  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer && product) {
      window.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currency: 'TRY',
          value: parseFloat(product.currentPrice || product.price),
          items: [
            {
              item_id: product.id,
              item_name: product.name,
              price: parseFloat(parseFloat(item.currentPrice || item.price).toFixed(2)), // ✅ sayısal ve 2 hane
              item_brand: 'Kaşarcım',
              item_category: product.category?.name || 'Peynir',
              quantity: 1
            }
          ]
        }
      });
    }
  }, [product]);
  // Sayfa yüklendiğinde en üste kaydır
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatWeight = (weightInGrams) => {
    if (!weightInGrams) return '';
    
    if (weightInGrams >= 1000) {
      return `${(weightInGrams / 1000).toLocaleString('tr-TR')} kg`;
    } else {
      return `${weightInGrams.toLocaleString('tr-TR')} g`;
    }
  };

  useEffect(() => {
    if (!initialProduct) {
      setLoading(true);
    const fetchProductData = async () => {
      try {
        const updatedProduct = await ProductService.getProductDetail(slug);
        setProduct(updatedProduct);
      } catch (error) {
        console.error('Ürün verisi alınamadı:', error);
        } finally {
          setLoading(false);
      }
    };

    fetchProductData();
    }
  }, [slug, initialProduct]);
  
  // Ürünün son puanını güncelle
  useEffect(() => {
    if (refreshProduct) {
      setLoading(true);
      const fetchProductData = async () => {
        try {
          // ProductService'i kullanarak ürün detayını getir
          const updatedProduct = await ProductService.getProductDetail(slug);
          
          // Ürün bilgilerini güncelle
          setProduct(updatedProduct);
          setRefreshProduct(false);
        } catch (error) {
          console.error('Ürün verisi güncellenemedi:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProductData();
    }
  }, [refreshProduct, slug]);
  
  // Kullanıcının yorum yapıp yapmadığını kontrol et
  useEffect(() => {
    // LocalStorage'dan token'ı al
    const token = localStorage.getItem('token');
    
    // Eğer token varsa, kullanıcının yorumunu kontrol et
    if (token) {
      const checkUserReview = async () => {
        try {
          // api servisi ile özel endpoint'i çağırıyoruz
          const data = await api.get(`products/${slug}/has-reviewed/`);
          setUserHasReviewed(data.has_reviewed || false);
        } catch (error) {
          console.error('Kullanıcı yorumu kontrol edilemedi:', error);
        }
      };
      
      checkUserReview();
    }
  }, [slug]);
  
  const navigateToCart = () => {
    router.push('/sepet');
  };
  
  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    
    setAddingToCart(true);
    
    try {
      // Context API'deki addToCart fonksiyonunu çağır
      addToCart(product, quantity);
      
    
      
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      toast.error('Ürün sepete eklenirken hata oluştu');
    } finally {
      setTimeout(() => {
        setAddingToCart(false);
      }, 500);
    }
  };
  
  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;
    
    setBuyingNow(true);
    
    try {
      // Önce sepete ekle
      addToCart(product, quantity);
      
      // Sonra ödeme sayfasına yönlendir
      setTimeout(() => {
        router.push('/odeme');
      }, 300);
      
    } catch (error) {
      console.error('Hemen al işleminde hata:', error);
      toast.error('İşlem sırasında bir hata oluştu');
    } finally {
      setTimeout(() => {
        setBuyingNow(false);
      }, 500);
    }
  };

  if (loading) {
    return <PageLoader />;
  }
  
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-orange-50 text-orange-700 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Ürün bulunamadı</h2>
          <p className="mb-4">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/urunler" className="inline-flex items-center text-orange-700 hover:text-orange-600 font-medium">
            <FaArrowLeft className="mr-2" /> Tüm ürünlere dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <div className="mb-4 sm:mb-6">
        <Link href="/urunler" className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors duration-300 group">
          <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" /> 
          <span className="border-b border-transparent group-hover:border-orange-500 pb-1 transition-colors duration-300">Ürünlere geri dön</span>
        </Link>
      </div>
      
      {/* Ana Ürün Kartı */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
          {/* Sol Taraf - Ürün Resmi */}
          <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
            <Image
              src={product?.img_url || "/images/placeholder.png"}
              alt={product?.name || 'Ürün Resmi'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              priority
            />
            {product?.active_discount && product?.discounted_price && (
              <div className="absolute top-4 left-4 bg-red-500 text-white font-bold py-1 px-3 rounded-full shadow-md transform rotate-2 animate-pulse">
                %{product?.active_discount?.discount_percentage} İndirim
              </div>
            )}
          </div>
          
          {/* Sağ Taraf - Ürün Bilgileri */}
          <div className="flex flex-col">
            {/* Kategori */}
            <div className="mb-2">
              <Link 
                href={`/urunler?category=${product?.category_slug || product?.category?.slug || ''}`} 
                className="inline-block bg-orange-50 text-orange-600 text-sm font-medium px-3 py-1 rounded-full hover:bg-orange-100 hover:scale-105 transition-all duration-300"
              >
                {product?.category_name || product?.category?.name || 'Peynir'}
              </Link>
            </div>
            
            {/* Başlık */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 relative inline-block">
              {product?.name}
              <span className="absolute bottom-[-4px] left-0 w-1/4 mt-3 h-1 bg-orange-500 rounded-full"></span>
            </h1>
            
            {/* Puanlama */}
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.round(product?.rating || 4.0) ? "text-yellow-400 transform hover:scale-110 transition-transform" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {(product?.rating || 4.0).toFixed(1)} ({product?.review_count || 0} değerlendirme)
              </span>
            </div>
            
            {/* Açıklama */}
            <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed">{product?.description}</p>
            
            {/* Fiyat Bilgisi */}
            <div className="mb-4 sm:mb-6">
              {product?.active_discount && product?.discounted_price ? (
                <>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-orange-600 mr-3">
                      {product?.discounted_price?.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </span>
                    <span className="text-base sm:text-lg text-gray-400 line-through">
                      {product?.price?.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </span>
                  </div>
                  <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold px-4 py-1 rounded-full mb-2 shadow-sm">
                    %{product?.active_discount?.discount_percentage} İndirim
                  </div>
                </>
              ) : (
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">
                  {parseFloat(product?.price)?.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </div>
              )}
              <div className="text-sm text-gray-500">Ağırlık: {formatWeight(product?.weight) || '500g'}</div>
            </div>
            
            {/* Stok Durumu */}
            <div className="mb-4 sm:mb-6">
              <div className={`inline-flex items-center text-sm px-3 py-1 rounded-full font-medium 
                            border border-transparent
                            ${product?.stock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${product?.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span>{product?.stock > 0 ? 'Stokta var' : 'Stokta yok'}</span>
              </div>
            </div>
            
            {/* Sepete Ekle */}
            <div className="flex items-center space-x-4 mb-6 sm:mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 sm:w-12 py-2 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                >
                  +
                </button>
              </div>
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={!product?.stock || addingToCart || buyingNow}
                  className={`${product?.stock > 0 ? 'bg-orange-500 hover:bg-orange-600 transform hover:-translate-y-1' : 'bg-gray-400 cursor-not-allowed'} 
                            text-white py-3 px-4 sm:px-6 rounded-lg font-semibold flex items-center justify-center
                            transition-all duration-300 shadow-md hover:shadow-lg relative overflow-hidden`}
                >
                  {addingToCart ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm sm:text-base">Ekleniyor...</span>
                    </div>
                  ) : (
                    <>
                      <FaCartPlus className="mr-2 text-lg" /> 
                      <span className="text-sm sm:text-base">{product?.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}</span>
                    </>
                  )}
                  {product?.stock > 0 && !addingToCart && (
                    <span className="absolute w-full h-full top-0 left-0 bg-white opacity-20 transform -translate-x-full animate-shine-first"></span>
                  )}
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  disabled={!product?.stock || addingToCart || buyingNow}
                  className={`${product?.stock > 0 ? 'bg-green-600 hover:bg-green-700 transform hover:-translate-y-1' : 'bg-gray-400 cursor-not-allowed'} 
                            text-white py-3 px-4 sm:px-6 rounded-lg font-semibold flex items-center justify-center
                            transition-all duration-300 shadow-md hover:shadow-lg relative overflow-hidden`}
                >
                  {buyingNow ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm sm:text-base">Hazırlanıyor...</span>
                    </div>
                  ) : (
                    <>
                      <FaBolt className="mr-2 text-lg" /> 
                      <span className="text-sm sm:text-base">{product?.stock > 0 ? 'Hemen Al' : 'Stokta Yok'}</span>
                    </>
                  )}
                  {product?.stock > 0 && !buyingNow && (
                    <span className="absolute w-full h-full top-0 left-0 bg-white opacity-20 transform -translate-x-full animate-shine-second"></span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Teslimat Bilgileri */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-gradient-to-b from-gray-50 to-white p-2 sm:p-3 rounded-lg text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-center text-orange-500 mb-1 sm:mb-2">
                  <FaShippingFast className="text-xl" />
                </div>
                <p className="text-sm font-medium">Hızlı Teslimat</p>
                <p className="text-xs text-gray-500">24 Saatte Kargo</p>
              </div>
              
              <div className="bg-gradient-to-b from-gray-50 to-white p-2 sm:p-3 rounded-lg text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-center text-orange-500 mb-1 sm:mb-2">
                  <FaRegCreditCard className="text-xl" />
                </div>
                <p className="text-sm font-medium">Güvenli Ödeme</p>
                <p className="text-xs text-gray-500">Tüm Kartlar</p>
              </div>
              
              <div className="bg-gradient-to-b from-gray-50 to-white p-2 sm:p-3 rounded-lg text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-center text-orange-500 mb-1 sm:mb-2">
                  <FaShieldAlt className="text-xl" />
                </div>
                <p className="text-sm font-medium">Kalite Garantisi</p>
                <p className="text-xs text-gray-500">%100 Memnuniyet</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Menüsü */}
        <div className="border-t border-gray-200">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 sm:py-4 font-medium text-center transition-all duration-300 text-sm sm:text-base
                        ${activeTab === 'details' 
                          ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50' 
                          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'}`}
            >
              Ürün Detayları
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 sm:py-4 font-medium text-center transition-all duration-300 text-sm sm:text-base
                        ${activeTab === 'reviews' 
                          ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50' 
                          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'}`}
            >
              Yorumlar ({product?.review_count || 0})
            </button>
          </div>
          
          {/* Tab İçerikleri */}
          <div className="p-4 sm:p-6 md:p-8">
            {activeTab === 'details' && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 relative inline-block">
                  Ürün Özellikleri
                  <span className="absolute bottom-0 left-0 w-1/4 h-1 bg-orange-500 rounded-full"></span>
                </h2>
                
                <p className="mb-6">{product?.long_description || product?.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Özellikler</h3>
                    <ul className="space-y-3">
                      {product?.features ? (
                        product?.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start">
                            <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                            <span>%100 Doğal içerik</span>
                          </li>
                          <li className="flex items-start">
                            <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                            <span>Katkı maddesi içermez</span>
                          </li>
                          <li className="flex items-start">
                            <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                            <span>Geleneksel yöntemlerle üretilmiştir</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">İçindekiler</h3>
                    <p>{product?.ingredients || 'Pastörize inek sütü, tuz, starter kültür, maya.'}</p>
                    
                    <div className="mt-6">
                      <h4 className="font-semibold text-lg mb-2">Besin Değerleri</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white p-2 rounded shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                          <span className="font-medium">Protein:</span> 25g/100g
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                          <span className="font-medium">Yağ:</span> 30g/100g
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                          <span className="font-medium">Karbonhidrat:</span> 2g/100g
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                          <span className="font-medium">Kalori:</span> 350kcal/100g
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm flex items-start hover:shadow-md transition-all duration-300 border border-blue-100">
                  <FaInfoCircle className="text-blue-500 text-xl mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Saklama Koşulları</h3>
                    <p className="text-blue-800">
                      {product?.storage_conditions || "Buzdolabında 4°C'de saklayınız. Açıldıktan sonra 3 gün içinde tüketiniz. Ürün ambalajında belirtilen son kullanma tarihine dikkat ediniz."}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 relative inline-block">
                    Ürün Değerlendirmesi
                    <span className="absolute bottom-0 left-0 w-1/4 h-1 bg-orange-500 rounded-full"></span>
                  </h2>
                  <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Ürün puanı özeti */}
                      <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6">
                        <div className="flex flex-col items-center">
                          <div className="text-4xl font-bold text-gray-800 mb-2">
                            {(product?.rating || 4.0).toFixed(1)}
                          </div>
                          <div className="flex text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                className={`${i < Math.round(product?.rating || 4.0) ? "text-yellow-400" : "text-gray-300"} transform hover:scale-110 transition-transform`} 
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product?.review_count || 0} değerlendirme
                          </div>
                        </div>
                      </div>
                      
                      {/* Puanlama bileşeni */}
                      <div className="md:w-2/3">
                        <ProductRating 
                          product={product} 
                          slug={slug} 
                          onRatingChange={() => {
                            setRefreshProduct(true);
                            toast.success('Puanınız kaydedildi, ürün puanları güncelleniyor...', {
                              style: {
                                background: 'linear-gradient(to right, #FFF7ED, #FFF8F1)',
                                borderLeft: '5px solid #FF6B00',
                                boxShadow: '0 8px 30px rgba(255, 107, 0, 0.15)',
                                color: '#c2410c',
                                padding: '16px'
                              }
                            });
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <ProductReviews 
                  product={product} 
                  slug={slug} 
                  onReviewChange={() => {
                    setRefreshProduct(true);
                    setUserHasReviewed(true);
                  }}
                  userHasReviewed={userHasReviewed}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Animasyon için CSS */}
      <style jsx global>{`
        @keyframes shine {
          to {
            transform: translateX(100%);
          }
        }
        .animate-shine-first {
          animation: shine 3s infinite;
          animation-delay: 0s;
        }
        .animate-shine-second {
          animation: shine 3s infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
} 