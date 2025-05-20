"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FaShoppingCart, FaUser, FaUserCircle, FaSignOutAlt, FaClipboardList, FaHome, FaSpinner } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './LoginModal';
import Image from 'next/image';

export default function Navbar() {
  const { cartItemsCount } = useCart();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dropdown dışında bir yere tıklandığında dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-orange-500 font-bold text-2xl">
             <Image
                src="/images/kasarcim-logo.svg"
                alt="Kaşarcım Logo"
                width={150}
                height={50}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          
          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium">
              Ana Sayfa
            </Link>
            <Link href="/urunler" className="text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium">
              Ürünler
            </Link>
            <Link href="/hakkimizda" className="text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium">
              İletişim
            </Link>
          </div>
          
          {/* Right Side - Login and Cart */}
          <div className="flex items-center space-x-4">
            {loading ? (
              // Yükleme durumunda animasyonlu loader göster
              <div className="flex items-center justify-center w-10 h-10">
                <FaSpinner className="animate-spin text-orange-500 w-5 h-5" />
              </div>
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors cursor-pointer"
                >
                  <FaUserCircle className="w-6 h-6" />
                </div>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-100 transition-all duration-150 transform origin-top">
                    <div className="border-b border-gray-100 pb-2 px-4 mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      href="/profilim" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaUser className="mr-3 h-4 w-4" />
                      Profilim
                    </Link>
                    
                    <Link 
                      href="/siparisler" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaClipboardList className="mr-3 h-4 w-4" />
                      Siparişlerim
                    </Link>
                    
                    <Link 
                      href="/adreslerim" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaHome className="mr-3 h-4 w-4" />
                      Adreslerim
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <FaSignOutAlt className="mr-3 h-4 w-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Giriş Yap
              </button>
            )}
            
            <Link href="/sepet" className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors relative">
              <FaShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
      
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </nav>
  );
} 