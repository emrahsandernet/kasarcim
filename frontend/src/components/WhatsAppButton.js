"use client";

import { FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function WhatsAppButton() {
  // WhatsApp numarası
  const phoneNumber = "905523963141"; // Gerçek numarayı burada belirtin (başında 90 ile)
  
  // WhatsApp link URL'sini oluştur
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Merhaba%2C%20Kaşarcım%20hakkında%20bilgi%20almak%20istiyorum.`;
  
  // Scroll pozisyonunu izle
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <a 
    href={whatsappUrl}
    target="_blank" 
    rel="noopener noreferrer"
    className={`fixed ${isScrolled ? 'bottom-4 md:bottom-6' : 'bottom-4 md:bottom-6'} right-4 md:right-4 z-[9999] flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 text-white shadow-xl hover:bg-green-600 transition-all duration-300 hover:scale-110 md:hover:scale-105 pulse-animation`}
    aria-label="WhatsApp ile iletişime geç"
    style={{
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
    }}
  >
    <FaWhatsapp className="w-6 h-6 md:w-7 md:h-7" />
    <span className="sr-only">WhatsApp ile İletişime Geç</span>
  
    <style jsx>{`
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(37, 211, 102, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
        }
      }
  
      .pulse-animation {
        animation: pulse 2s infinite;
      }
    `}</style>
  </a>
  );
} 