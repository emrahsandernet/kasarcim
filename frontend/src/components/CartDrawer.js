"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import CustomLink from './CustomLink';
import { FaTimes, FaShoppingCart, FaCreditCard, FaPlus, FaMinus, FaTrash, FaSpinner } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/context/LoaderContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoingToCart, setIsGoingToCart] = useState(false);
  const {
    cartItems,
    cartTotal,
    cartItemsCount,
    updateQuantity,
    removeFromCart,
    discountedTotal,
    shippingCost,
    discount,
    couponCode
  } = useCart();
  const { showLoader } = useLoader();

  // Body scroll'unu kontrol et
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    setIsProcessing(true);
    showLoader(); // Loader'ı göster
    
    // 1.5 saniye sonra ödeme sayfasına yönlendir
    setTimeout(() => {
      router.push('/odeme');
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  const handleGoToCart = () => {
    setIsGoingToCart(true);
    showLoader(); // Loader'ı göster
    
    // 1.5 saniye sonra sepet sayfasına yönlendir
    setTimeout(() => {
      router.push('/sepet');
      setIsGoingToCart(false);
      onClose();
    }, 1500);
  };

  // Framer Motion variants
  const backdropVariants = {
    hidden: { 
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const drawerVariants = {
    hidden: { 
      x: '100%',
      transition: {
        type: "tween",
        ease: "easeInOut",
        duration: 0.3
      }
    },
    visible: { 
      x: 0,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.4
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-gray-500 z-[60]"
            style={{ backgroundColor: 'rgba(107, 114, 128, 0.75)' }}
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div 
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-[70]"
          >
            {/* Header */}
            <motion.div 
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-between p-4 border-b border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaShoppingCart className="mr-2 text-orange-500" />
                Sepetim ({cartItemsCount})
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="h-5 w-5 text-gray-500" />
              </motion.button>
            </motion.div>

            {/* Content */}
            <motion.div 
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-full"
            >
              {cartItems.length === 0 ? (
                // Boş sepet durumu
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <FaShoppingCart className="h-12 w-12 text-gray-400" />
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg font-medium text-gray-900 mb-2"
                  >
                    Sepetiniz boş
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-500 mb-6"
                  >
                    Sepetinize henüz ürün eklemediniz.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CustomLink
                      href="/urunler"
                      onClick={onClose}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Alışverişe Başla
                    </CustomLink>
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* Ücretsiz kargo bildirimi */}
                  {cartTotal < 1500 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-orange-50 border border-orange-200 p-3 mx-4 mt-4 rounded-lg"
                    >
                      <p className="text-sm text-orange-800">
                        <span className="font-medium">
                          {(1500 - cartTotal).toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </span> daha alışveriş yapın, <span className="font-medium">ücretsiz kargo</span> kazanın!
                      </p>
                      <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(cartTotal / 1500) * 100}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className="bg-orange-500 h-2 rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Ürün listesi */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cartItems.map((item, index) => {
                      const hasDiscount = item.active_discount !== null && item.active_discount !== undefined;
                      const currentPrice = item.currentPrice !== undefined ? item.currentPrice : item.price;
                      const originalPrice = item.price;

                      return (
                        <motion.div 
                          key={item.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.1 + (index * 0.05) }}
                          whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                          className="bg-gray-50 rounded-lg p-3 cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            {/* Ürün resmi */}
                            <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.img_url || '/images/placeholder.png'}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>

                            {/* Ürün bilgileri */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                {item.name}
                              </h4>
                              
                              {/* Fiyat */}
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-semibold text-gray-900">
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

                              {/* Miktar kontrolü */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                  >
                                    <FaMinus className="h-3 w-3 text-gray-600" />
                                  </motion.button>
                                  <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">
                                    {item.quantity}
                                  </span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                  >
                                    <FaPlus className="h-3 w-3 text-gray-600" />
                                  </motion.button>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.1, color: "#dc2626" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                >
                                  <FaTrash className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Footer - Özet ve butonlar */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border-gray-200 p-4 space-y-4"
                  >
                    {/* Özet */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-base font-semibold pt-2">
                       <div className='flex items-center space-x-2' >
                        <span className="text-gray-900">Toplam :</span>
                        <span className="text-gray-900">
                          {(discountedTotal ).toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </span>
                       </div>
                       <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGoToCart}
                        disabled={isGoingToCart}
                        className="text-gray-900 font-medium flex items-center justify-center transition-colors disabled:opacity-75"
                      >
                        {isGoingToCart ? (
                          <>
                            <FaSpinner className="mr-2 animate-spin" />
                            Yönlendiriliyor...
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="mr-2" />
                            Sepete Git
                          </>
                        )}
                      </motion.button>
                      
                      </div>
                    </div>

                    {/* Butonlar */}
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-75 text-white py-3 px-4 font-medium flex items-center justify-center transition-colors"
                      >
                        {isProcessing ? (
                          <>
                            <FaSpinner className="mr-2 animate-spin" />
                            Hazırlanıyor...
                          </>
                        ) : (
                          <>
                            <FaCreditCard className="mr-2" />
                            ÖDEME ADIMINA GİT
                          </>
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
                      >
                        <FaTimes className="mr-2" />
                        Sepeti Kapat
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 