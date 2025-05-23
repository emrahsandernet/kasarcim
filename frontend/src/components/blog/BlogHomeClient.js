'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BlogHomeClient({ featuredPost, posts, categories, pagination }) {
  const router = useRouter();
  
  // Debug: pagination prop'unu hemen loglayalım
  console.log("BlogHomeClient pagination prop:", pagination);
  
  // Backend pagination bilgisi
  const hasPagination = !!pagination;
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  



  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (pageNumber) => {
    if (pageNumber === currentPage) return;
    console.log(`Sayfa değiştiriliyor: ${currentPage} -> ${pageNumber}`);
    
    // URL'yi güncelle ve tam sayfa yenileme yap
    if (pageNumber === 1) {
      router.push('/blog');
    } else {
      router.push(`/blog?page=${pageNumber}`);
    }
  };

  // Blog yazısı olup olmadığını kontrol et
  // Eğer öne çıkan yazı varsa veya normal yazı listesi varsa (ve boş değilse) blog var demektir
  const hasBlogContent = !!featuredPost || (Array.isArray(posts) && posts.length > 0);
  
  // Debug için zorla sayfalama göster
  const forcePagination = true;
  const debugTotalPages = pagination?.totalPages || 3;
  
  // Blog kartlarında gösterilen içerik sayısını konsola yazdır
  
  // Sayfalama için gösterilecek sayfa numaralarını hesapla
  const getVisiblePageNumbers = () => {
    if (!pagination || !pagination.totalPages) return [];
    
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
    
    // Mobil için daha az sayfa göster
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const maxVisible = isMobile ? 5 : 9;
    
    // Eğer toplam sayfa sayısı maxVisible veya daha azsa, tüm sayfaları göster
    if (totalPages <= maxVisible) {
      return Array.from({length: totalPages}, (_, i) => i + 1);
    }
    
    // Sayfa sayısı çoksa, akıllı görüntüleme yapalım
    let pageNumbers = [];
    
    if (isMobile) {
      // Mobil için daha basit algoritma
      if (currentPage <= 3) {
        // İlk sayfadayız: 1 2 3 ... son
        pageNumbers = [1, 2, 3, null, totalPages];
      } else if (currentPage >= totalPages - 2) {
        // Son sayfadayız: 1 ... son-2 son-1 son
        pageNumbers = [1, null, totalPages - 2, totalPages - 1, totalPages];
      } else {
        // Ortadayız: 1 ... mevcut ... son
        pageNumbers = [1, null, currentPage, null, totalPages];
      }
    } else {
      // Desktop için önceki algoritma
      if (currentPage <= 3) {
        pageNumbers = [1, 2, 3, 4, 5, null, totalPages - 1, totalPages];
      } else if (currentPage >= totalPages - 2) {
        pageNumbers = [1, 2, null, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pageNumbers = [
          1, 2, 
          null, 
          currentPage - 1, currentPage, currentPage + 1, 
          null, 
          totalPages - 1, totalPages
        ];
      }
    }
    
    // null değerleri filtreleyip, elipsis olarak işaretle
    return pageNumbers.map((num, index) => {
      if (num === null) {
        return { isEllipsis: true, key: `ellipsis-${index}` };
      }
      return num;
    });
  };
  
  // Sayfa numaralarını hesapla
  const visiblePageNumbers = getVisiblePageNumbers();
  
  return (
    <div className="container max-w-6xl mx-auto px-4 md:px-8 py-20">


      {/* Öne Çıkan Yazı - Modern ve Sadeleştirilmiş */}
      {featuredPost && (
        <div className="mb-24">
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden relative transition-all duration-300 hover:shadow-md">
            <div className="md:flex">
              {/* Resim genişliği sabit olsun */}
              <div className="md:w-1/2 relative h-72 md:h-auto" style={{ minWidth: '400px', maxWidth: '500px' }}>
                <Image 
                  src={featuredPost.featured_image} 
                  alt={featuredPost.title}
                  width={800}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                {featuredPost.categories && featuredPost.categories.length > 0 && (
                  <span className="inline-block text-xs font-medium text-amber-600 mb-4 uppercase tracking-wider">
                    {featuredPost.categories[0].name}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-light text-gray-800 mb-5 leading-tight">
                  {featuredPost.title}
                </h2>
                <div className="text-gray-600 mb-8 font-light leading-relaxed h-24 overflow-hidden">
                  <p className="line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>
                <div className="flex items-center mb-8">
                  <div className="mr-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      {featuredPost.author_name?.[0] || 'A'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{featuredPost.author_name || 'Admin'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(featuredPost.published_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <Link 
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-block px-8 py-3 border border-amber-400 text-amber-600 hover:bg-amber-50 font-medium rounded-lg transition-all duration-300"
                >
                  Okumaya Başla
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Yazıları Grid - Minimalist Kartlar */}
      <div className="mb-24" id="blog-posts">
        <h2 className="text-2xl font-light text-gray-800 mb-12 pb-4 border-b border-gray-100">
          {currentPage > 1 ? `Son Yazılar - Sayfa ${currentPage}` : 'Son Yazılar'}
        </h2>
        
      
        {/* Son yazıları gösterme koşulunu basitleştirelim */}
        {Array.isArray(posts) && posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post) => (
                <article key={post.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md group flex flex-col" style={{ height: '500px' }}>
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative h-56 overflow-hidden">
                      <Image 
                        src={post.featured_image} 
                        alt={post.title}
                        width={400}
                        height={300}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </Link>
                  <div className="p-7 flex flex-col flex-grow">
                    {post.categories && post.categories.length > 0 && (
                      <span className="inline-block text-xs font-medium text-amber-600 mb-3 uppercase tracking-wider">
                        {post.categories[0].name}
                      </span>
                    )}
                    <Link href={`/blog/${post.slug}`} className="block mb-3">
                      <h3 className="text-xl font-light text-gray-800 leading-tight group-hover:text-amber-600 transition-colors duration-300 line-clamp-2 h-14 overflow-hidden">
                        {post.title}
                      </h3>
                    </Link>
                    <div className="text-gray-600 mb-5 font-light leading-relaxed flex-grow h-20 overflow-hidden">
                      <p className="line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-xs text-gray-500">
                        {new Date(post.published_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="text-amber-600 font-medium text-sm hover:text-amber-700 transition-colors duration-300"
                      >
                        Oku →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            {/* Mobil Uyumlu Sayfalama UI */}
            <div className="flex justify-center mt-16">
              <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                {/* Önceki sayfa düğmesi */}
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 md:px-4 h-8 md:h-10 rounded-lg border text-sm md:text-base ${currentPage === 1 
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'border-amber-200 text-amber-600 hover:bg-amber-50'} transition-all duration-200`}
                  aria-label="Önceki sayfa"
                >
                  <span className="hidden sm:inline">Önceki</span>
                  <span className="sm:hidden">‹</span>
                </button>
                
                {/* Sayfa numaraları - Akıllı sayfalama ile */}
                {visiblePageNumbers.map((item, index) => (
                  item.isEllipsis ? (
                    // Elipsis göster
                    <span 
                      key={item.key} 
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-400 text-sm md:text-base"
                    >
                      ...
                    </span>
                  ) : (
                    // Sayfa numarası göster
                    <button
                      key={item}
                      onClick={() => handlePageChange(item)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-sm md:text-base transition-all duration-200 ${currentPage === item 
                        ? 'bg-amber-500 text-white shadow-sm' 
                        : 'border border-gray-200 text-gray-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600'}`}
                      aria-label={`Sayfa ${item}`}
                      aria-current={currentPage === item ? 'page' : undefined}
                    >
                      {item}
                    </button>
                  )
                ))}
                
                {/* Sonraki sayfa düğmesi */}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === (pagination?.totalPages || debugTotalPages)}
                  className={`px-3 md:px-4 h-8 md:h-10 rounded-lg border text-sm md:text-base ${currentPage === (pagination?.totalPages || debugTotalPages) 
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'border-amber-200 text-amber-600 hover:bg-amber-50'} transition-all duration-200`}
                  aria-label="Sonraki sayfa"
                >
                  <span className="hidden sm:inline">Sonraki</span>
                  <span className="sm:hidden">›</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white border border-gray-100 rounded-lg p-8 text-center mb-16">
            {/* Öne çıkan yazı varsa bile, son yazılar kısmı boş olabilir */}
            <p className="text-gray-600 font-light">
              {featuredPost ? 'Şu anda başka blog yazısı bulunmamaktadır.' : 'Henüz blog yazısı bulunmamaktadır.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 