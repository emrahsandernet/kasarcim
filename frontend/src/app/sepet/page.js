"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaCreditCard, FaTimes, FaTag } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartTotal,
    couponCode,
    discount,
    discountedTotal,
    shippingCost,
    applyCoupon,
    removeCoupon,
    couponLoading
  } = useCart();
  
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  
  // Client side rendering için
  useEffect(() => {
    setMounted(true);
    // Eğer aktif bir kupon varsa, input alanına ekle
    if (couponCode) {
      setCouponInput(couponCode);
    }
  }, [couponCode]);
  
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    applyCoupon(couponInput);
  };
  
  // Boş sepet durumu
  if (mounted && cartItems.length === 0) {
    return (
      <div className="py-8 sm:py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Sepetiniz</h1>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-8">
            <div className="flex flex-col items-center">
              <Image
                src="/images/empty-cart.svg"
                alt="Boş Sepet"
                width={150}
                height={150}
                className="mb-4 sm:mb-6 w-32 sm:w-40 md:w-48 h-auto"
              />
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Sepetiniz şu anda boş</h2>
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-md text-sm sm:text-base">
                Sepetinize henüz ürün eklemediniz. Alışverişe başlamak için ürünlerimize göz atabilirsiniz.
              </p>
              <Link href="/urunler" className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-semibold transition-colors text-sm sm:text-base">
                Alışverişe Başla
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!mounted) {
    return <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">Yükleniyor...</div>;
  }
  
  return (
    <div className="py-8 sm:py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Sepetiniz</h1>
      
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Sol taraf: Sepet öğeleri */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* Masaüstü görünümü için tablo */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 sm:py-4 px-4 sm:px-6 text-left">Ürün</th>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-center">Fiyat</th>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-center">İndirim</th>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-center">Adet</th>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-center">Toplam</th>
                    <th className="py-3 sm:py-4 px-3 sm:px-4 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cartItems.map((item) => {
                    const hasDiscount = item.active_discount !== null && item.active_discount !== undefined;
                    const originalPrice = item.price;
                    const currentPrice = item.currentPrice !== undefined ? item.currentPrice : item.price;
                    const discountAmount = hasDiscount ? originalPrice - currentPrice : 0;
                    const discountPercentage = hasDiscount && item.active_discount?.discount_percentage 
                      ? item.active_discount.discount_percentage 
                      : 0;
                      
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 sm:py-4 px-4 sm:px-6">
                          <div className="flex items-center">
                            <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 relative rounded overflow-hidden">
                              <Image
                                src={item.img_url || '/images/placeholder.png'}
                                alt={item.name}
                                fill
                                sizes="(max-width: 640px) 56px, 64px"
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</div>
                              {item.weight && (
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {item.weight >= 1000 
                                    ? `${(item.weight / 1000).toLocaleString('tr-TR')} kg`
                                    : `${item.weight.toLocaleString('tr-TR')} g`}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center text-gray-900 text-sm sm:text-base">
                          {originalPrice.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center">
                          {hasDiscount ? (
                            <div>
                              <span className="text-red-600 font-medium text-sm sm:text-base">%{discountPercentage}</span>
                              <br />
                              <span className="text-green-600 text-xs">
                                {discountAmount.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm sm:text-base">-</span>
                          )}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4">
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded"
                            >
                              <FaMinus className="h-3 w-3" />
                            </button>
                            <span className="mx-2 sm:mx-3 w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1 rounded"
                            >
                              <FaPlus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center font-medium text-gray-900 text-sm sm:text-base">
                          {(currentPrice * item.quantity).toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                          {hasDiscount && (
                            <div className="text-xs text-gray-500 line-through">
                              {(originalPrice * item.quantity).toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </div>
                          )}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Mobil görünüm için kartlar */}
            <div className="md:hidden divide-y divide-gray-200">
              {cartItems.map((item) => {
                const hasDiscount = item.active_discount !== null && item.active_discount !== undefined;
                const originalPrice = item.price;
                const currentPrice = item.currentPrice !== undefined ? item.currentPrice : item.price;
                const discountAmount = hasDiscount ? originalPrice - currentPrice : 0;
                const discountPercentage = hasDiscount && item.active_discount?.discount_percentage 
                  ? item.active_discount.discount_percentage 
                  : 0;
                  
                return (
                  <div key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex mb-3">
                      {/* Ürün resmi ve adı */}
                      <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.img_url || '/images/placeholder.png'}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.weight && (
                          <div className="text-xs text-gray-500">
                            {item.weight >= 1000 
                              ? `${(item.weight / 1000).toLocaleString('tr-TR')} kg`
                              : `${item.weight.toLocaleString('tr-TR')} g`}
                          </div>
                        )}
                        
                        {/* Fiyat bilgileri */}
                        <div className="flex items-center mt-1">
                          <span className="text-gray-900 font-medium mr-2">
                            {currentPrice.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-500 line-through">
                              {originalPrice.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          )}
                        </div>
                        
                        {/* İndirim bilgisi */}
                        {hasDiscount && (
                          <div className="text-xs text-red-600 font-medium mt-1">
                            %{discountPercentage} indirim ({discountAmount.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })})
                          </div>
                        )}
                      </div>
                      
                      {/* Kaldır butonu */}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 self-start"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Alt kısım: Miktar ve toplam */}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 text-sm mr-2">Miktar:</span>
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1"
                          >
                            <FaMinus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-1 bg-white text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1"
                          >
                            <FaPlus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-gray-600 text-xs">Toplam:</div>
                        <div className="font-semibold text-gray-900">
                          {(currentPrice * item.quantity).toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-between gap-4 mb-8">
            <Link href="/urunler" className="inline-flex items-center text-orange-500 hover:text-orange-600 text-sm sm:text-base">
              <FaArrowLeft className="mr-2" />
              Alışverişe Devam Et
            </Link>
            <button 
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm sm:text-base"
            >
              Sepeti Temizle
            </button>
          </div>
        </div>
        
        {/* Sağ taraf: Sipariş özeti */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold mb-3 sm:mb-4">Sipariş Özeti</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-3">
                <span className="text-sm sm:text-base">Ara Toplam</span>
                <span className="text-sm sm:text-base">
                  {cartTotal.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </span>
              </div>
              
              {/* Kupon indirimi (varsa) */}
              {discount > 0 && (
                <div className="flex justify-between border-b pb-3 text-green-600">
                  <span className="flex items-center text-sm sm:text-base">
                    <FaTag className="mr-2" />
                    İndirim ({couponCode})
                  </span>
                  <span className="text-sm sm:text-base">
                    -{discount.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between border-b pb-3">
                <span className="text-sm sm:text-base">Kargo</span>
                {shippingCost > 0 ? (
                  <span className="text-sm sm:text-base">
                    {shippingCost.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                ) : (
                  <span className="text-green-600 text-sm sm:text-base">Ücretsiz</span>
                )}
              </div>
              
              <div className="flex justify-between font-semibold">
                <span className="text-sm sm:text-base">Toplam</span>
                <span className="text-sm sm:text-base">
                  {(discountedTotal + shippingCost).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </span>
              </div>
              
              <div className="mt-4 sm:mt-6">
                <Link 
                  href="/odeme" 
                  onClick={() => {
                    if (typeof window !== "undefined" && window.dataLayer) {
                      window.dataLayer.push({
                        event: "begin_checkout",
                        ecommerce: {
                          items: cartItems.map((item) => ({
                            item_id: item.id,
                            item_name: item.name,
                            price: item.currentPrice || item.price,
                            quantity: item.quantity,
                            item_brand: "Kaşarcım",
                            item_category: item.category_name || item.category?.name || "Peynir"
                          }))
                        }
                      });
                    }
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-3 px-4 rounded-md font-semibold flex items-center justify-center text-sm sm:text-base transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <FaCreditCard className="mr-2" />
                  Siparişi Tamamla
                </Link>
              </div>
            </div>
          </div>
          
          {/* Kupon kodu giriş alanı */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3 sm:mb-4">Kupon Kodu</h2>
            
            {couponCode ? (
              <div className="mt-3">
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 flex justify-between items-center">
                  <div>
                    <span className="text-orange-700 font-medium flex items-center text-sm sm:text-base">
                      <FaTag className="mr-2" />
                      {couponCode}
                    </span>
                    <p className="text-xs text-orange-600 mt-1">
                      {discount.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })} indirim uygulandı
                    </p>
                  </div>
                  <button 
                    onClick={removeCoupon}
                    className="text-orange-700 hover:text-orange-900"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex flex-col space-y-3">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0">
                  <input 
                    type="text" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Kupon kodunuzu girin"
                    className="w-full sm:flex-grow px-4 py-2 border border-gray-300 rounded-md sm:rounded-r-none sm:rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <button 
                    type="submit"
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md sm:rounded-l-none sm:rounded-r-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    disabled={couponLoading || !couponInput}
                  >
                    {couponLoading ? 'Uygulanıyor...' : 'Uygula'}
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Kupon kodunuzu girerek indirimlerden yararlanabilirsiniz. Örnek kupon kodları: KASAR10, YENIYIL20
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 