"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { FaCheckCircle, FaArrowLeft, FaHome, FaBoxOpen } from 'react-icons/fa';
import Loader from '../components/Loader';

export default function SiparisBasariliPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orderInfo, setOrderInfo] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // Client-side rendering için
  useEffect(() => {
    setMounted(true);
    
    // URL'den sipariş bilgilerini al
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const orderId = searchParams.get('orderId');
      const totalAmount = searchParams.get('total');
      

      
      if (orderId && orderId !== 'undefined' && orderId !== 'null') {
        setOrderInfo({
          id: parseInt(orderId) + 91185,
          total: totalAmount ? parseFloat(totalAmount) : 0,
        });
      } else {
        // Sipariş bilgisi yoksa ana sayfaya yönlendir
        console.warn("Sipariş ID bulunamadı, ana sayfaya yönlendiriliyor");
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    }
  }, []);
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      const redirectPath = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectPath;
    }
  }, [mounted, authLoading, user]);
  
  if (!mounted || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <Loader size="large" />
      </div>
    );
  }
  
  if (!orderInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Sipariş bilgisi bulunamadı.</p>
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-medium">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-8 text-center border-b">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <FaCheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Siparişiniz Başarıyla Oluşturuldu!</h1>
          <p className="text-lg text-gray-600 mb-2">
            Siparişiniz başarıyla alındı ve işleme konuldu.
          </p>
          <p className="text-gray-600 mb-4">
            Sipariş numaranız: <span className="font-semibold">#{orderInfo.id }</span>
          </p>
          <div className="inline-block bg-green-50 rounded-md px-4 py-2 text-green-700 text-lg font-semibold">
            {orderInfo.total.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            })}
          </div>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-4">Ödeme Bilgileri</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-3">Banka Havalesi / EFT</h3>
            <p className="text-gray-600 mb-4">
              Lütfen aşağıdaki banka hesabına sipariş tutarını, sipariş numaranızı açıklamada belirterek gönderiniz:
            </p>
            
            <div className="border border-gray-200 rounded-md p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Banka Adı:</p>
                  <p className="font-medium">Enpara</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Şube:</p>
                  <p className="font-medium">Çekmeköy Şubesi (0070)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Hesap Sahibi:</p>
                  <p className="font-medium">Ramazan Deniz Sağ</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">IBAN:</p>
                  <p className="font-medium">TR72 0011 1000 0000 0070 5463 42</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
              <p className="text-sm">
                <strong>Önemli:</strong> Ödeme yaparken açıklama kısmına sipariş numaranızı (#
                {orderInfo.id}) yazmayı unutmayınız. Ödemeniz onaylandıktan sonra siparişiniz hazırlanacaktır.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-600">
            <p>
              Siparişinizle ilgili güncellemeler size e-posta yoluyla gönderilecektir.
              Herhangi bir sorunuz olursa lütfen bizimle <Link href="/iletisim" className="text-orange-500 hover:text-orange-600">iletişime geçin</Link>.
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <FaHome className="mr-2" />
            Ana Sayfaya Dön
          </Link>
          
          <Link href={`/siparisler/${orderInfo.id}`} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            <FaBoxOpen className="mr-2" />
            Sipariş Detayları
          </Link>
        </div>
      </div>
    </div>
  );
} 