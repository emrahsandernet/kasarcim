"use client";

import { useState, useEffect } from 'react';
import {  api } from '../services/api';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Backend'den duyuruları çekme
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await api.get('/announcements/');
   
       
  
        
        if (response && response.length > 0) {
          setAnnouncements(response);
        } else {
          // API'den veri gelmezse varsayılan duyuruları kullan
          setAnnouncements([
            {
              id: 1,
              message: "Tüm siparişlerde %15 indirim! Kupon kodu: KASAR15",
              link: "/urunler",
              link_text: "Şimdi Alışveriş Yap",
              background_color: "bg-orange-500",
              text_color: "text-white"
            },
            {
              id: 2,
              message: "1500₺ üzeri siparişlerde kargo bedava!",
              link: "/urunler",
              link_text: "Alışverişe Başla",
              background_color: "bg-blue-600",
              text_color: "text-white"
            },
            {
              id: 3,
              message: "Hafta içi 14:00'a kadar verilen siparişler aynı gün kargoda!",
              link: "/kargo-ve-teslimat",
              link_text: "Detaylar",
              background_color: "bg-green-600",
              text_color: "text-white"
            }
          ]);
        }
      } catch (error) {
        console.error("Duyurular yüklenirken hata oluştu:", error);
        setError(error.message);
        
        // Hata durumunda varsayılan duyuruları göster
        setAnnouncements([
          {
            id: 1,
            message: "Tüm siparişlerde %15 indirim! Kupon kodu: KASAR15",
            link: "/urunler",
            link_text: "Şimdi Alışveriş Yap",
            background_color: "bg-orange-500",
            text_color: "text-white"
          },
          {
            id: 2,
            message: "1500₺ üzeri siparişlerde kargo bedava!",
            link: "/urunler",
            link_text: "Alışverişe Başla",
            background_color: "bg-blue-600",
            text_color: "text-white"
          },
          {
            id: 3,
            message: "Hafta içi 14:00'a kadar verilen siparişler aynı gün kargoda!",
            link: "/kargo-ve-teslimat",
            link_text: "Detaylar",
            background_color: "bg-green-600",
            text_color: "text-white"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, []);

  // Otomatik duyuru değiştirme
  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % announcements.length);
    }, 5000); // 5 saniyede bir değiştir
    
    return () => clearInterval(interval);
  }, [announcements.length]);

  const closeAnnouncement = () => {
    setIsVisible(false);
    localStorage.setItem('announcementHidden', 'true');
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % announcements.length);
  };

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + announcements.length) % announcements.length);
  };

  // Yükleniyor durumu
  if (loading) return null;
  
  // Duyuru kapalıysa veya duyuru yoksa hiçbir şey gösterme
  if (!isVisible || announcements.length === 0) return null;

  const activeAnnouncement = announcements[activeIndex];

  return (
    <div className={`${activeAnnouncement.background_color} ${activeAnnouncement.text_color} w-full flex justify-center items-center`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-center sm:justify-between">
          <div className="w-full flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center sm:text-left">
            <span className="text-xs sm:text-sm font-medium">{activeAnnouncement.message}</span>
            {activeAnnouncement.link_text && (
              <a 
                href={activeAnnouncement.link}
                className="mt-1 sm:mt-0 sm:ml-2 px-2 py-0.5 underline bg-opacity-20 hover:bg-opacity-30 font-bold transition-colors text-xs sm:text-sm"
              >
                {activeAnnouncement.link_text}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 