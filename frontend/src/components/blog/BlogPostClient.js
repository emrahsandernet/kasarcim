'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegClock, FaRegCalendarAlt, FaRegUser, FaChevronRight, FaBookmark } from 'react-icons/fa';

// Okuma süresini hesapla
function calculateReadingTime(content) {
  const wordsPerMinute = 200; // Ortalama okuma hızı
  const wordCount = content?.trim().split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
}

// H2 başlığını section içeriğinden çıkar
function removeH2TitleFromContent(content) {
  if (!content) return '';
  // İlk H2 başlığını bul ve çıkar - greedy olmayan (non-greedy) regex kullanarak ilk eşleşmeyi sil
  return content.replace(/<h2[^>]*>.*?<\/h2>/, '').trim();
}

// İlk H2 başlığından önceki içeriği çıkar
function extractContentBeforeFirstH2(content) {
  if (!content) return '';
  const firstH2Index = content.indexOf('<h2');
  // Eğer H2 başlığı yoksa boş string döndür, varsa önceki içeriği al
  return firstH2Index > 0 ? content.substring(0, firstH2Index).trim() : '';
}

export default function BlogPostClient({ post, tableOfContents }) {
  const [activeSection, setActiveSection] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Sayfa kaydırıldığında aktif başlığı takip et
  useEffect(() => {
    if (typeof window === 'undefined' || tableOfContents.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    // Her başlık elementini izle
    tableOfContents.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) observer.observe(element);
    });
    
    // Okuma ilerlemesini takip et
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPosition = window.scrollY;
      const progress = (scrollPosition / totalHeight) * 100;
      setReadingProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);

    return () => {
      tableOfContents.forEach((heading) => {
        const element = document.getElementById(heading.slug);
        if (element) observer.unobserve(element);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, [tableOfContents]);

  // İlk H2 başlığından önceki içeriği çıkar
  const contentBeforeFirstH2 = extractContentBeforeFirstH2(post.content);

  return (
    <div className="container max-w-6xl mx-auto px-4 md:px-8 py-20">
      {/* Okuma İlerleme Çubuğu */}
      <div className="fixed top-0 left-0 z-50 h-0.5 bg-amber-400" style={{ width: `${readingProgress}%` }}></div>
      
      <article className="max-w-3xl mx-auto">
        {/* Başlık Kısmı - Minimalist Tasarım */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>
          
          {/* Meta Bilgileri */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-gray-600 mb-8">
            <div className="flex items-center">
              <FaRegUser className="text-amber-400 mr-2" />
              <span className="text-sm">{post.author_name || 'Admin'}</span>
            </div>
            <div className="flex items-center">
              <FaRegCalendarAlt className="text-amber-400 mr-2" />
              <span className="text-sm">{new Date(post.published_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center">
              <FaRegClock className="text-amber-400 mr-2" />
              <span className="text-sm">{post.reading_time || calculateReadingTime(post.content)} dakikalık okuma</span>
            </div>
            {post.categories && post.categories.length > 0 && (
              <div className="flex items-center">
                <span className="inline-block text-xs font-medium text-amber-600 uppercase tracking-wider">
                  {post.categories[0].name}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Kapak Görseli - Sadeleştirilmiş */}
        <div className="w-full h-96 mb-14 rounded-lg overflow-hidden border border-gray-100">
          <Image 
            src={post.featured_image} 
            alt={post.title}
            className="object-cover"
            priority
            width={1200}
            height={600}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        
        <div className="lg:flex lg:gap-16">
          {/* Yan Panel - İçindekiler Tablosu (Masaüstünde) */}
          {tableOfContents.length > 0 && (
            <div className="w-64 hidden lg:block sticky top-40 self-start flex-shrink-0 h-fit">
              <div className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-sm transition-all duration-300">
                <h3 className="text-base font-medium text-gray-800 mb-5 flex items-center">
                  <FaBookmark className="text-amber-400 mr-2" />
                  İçindekiler
                </h3>
                <ul className="space-y-4">
                  {tableOfContents.map((heading) => (
                    <li key={heading.id}>
                      <a 
                        href={`#${heading.slug}`} 
                        className={`flex items-center transition-colors text-sm ${
                          activeSection === heading.slug 
                            ? 'text-amber-600 font-medium' 
                            : 'text-gray-600 hover:text-amber-600'
                        }`}
                      >
                        <FaChevronRight className="text-amber-400 mr-2 text-xs" />
                        <span>{heading.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Ana İçerik */}
          <div className="lg:flex-1">
            {/* Mobil için İçindekiler Tablosu (Katlanabilir) */}
            {tableOfContents.length > 0 && (
              <div className="lg:hidden mb-10 bg-white border border-gray-100 rounded-lg p-5">
                <details>
                  <summary className="text-base font-medium text-gray-800 cursor-pointer flex items-center">
                    <FaBookmark className="text-amber-400 mr-2" />
                    İçindekiler
                  </summary>
                  <ul className="mt-5 space-y-3">
                    {tableOfContents.map((heading) => (
                      <li key={heading.id}>
                        <a 
                          href={`#${heading.slug}`} 
                          className="flex items-center text-gray-600 hover:text-amber-600 transition-colors text-sm"
                        >
                          <FaChevronRight className="text-amber-400 mr-2 text-xs" />
                          <span>{heading.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}

            {/* Giriş Bölümü */}
            <div className="prose prose-lg max-w-none mb-16">
              {post.excerpt && (
                <p className="text-xl font-light text-gray-700 mb-8 leading-relaxed first-letter:text-6xl first-letter:font-medium first-letter:text-amber-500 first-letter:mr-2 first-letter:float-left">
                  {post.excerpt}
                </p>
              )}
              
              {/* İlk H2 başlığından önceki içerik */}
              {contentBeforeFirstH2 && (
                <div 
                  className="prose prose-lg max-w-none prose-p:text-gray-700 prose-p:font-light prose-p:leading-relaxed prose-strong:text-gray-800 prose-strong:font-medium"
                  dangerouslySetInnerHTML={{ __html: contentBeforeFirstH2 }}
                />
              )}
            </div>
            
            {/* İçerik Bölümleri (Başlıklara göre) */}
            {tableOfContents.length > 0 ? (
              <div>
                {tableOfContents.map((section, index) => (
                  <section key={section.id} id={section.slug} className="mb-16 scroll-mt-24">
                    <h2 className="text-2xl font-light text-gray-800 mb-8 pb-2 border-b border-gray-100 relative">
                      {section.title}
                      <span className="absolute -left-5 top-0 transform text-3xl text-amber-300 opacity-20">#</span>
                    </h2>
                    <div 
                      className="prose prose-lg max-w-none 
                      prose-headings:text-gray-800 prose-headings:font-light prose-headings:mt-10 prose-headings:mb-5 
                      prose-h3:text-xl 
                      prose-p:text-gray-700 prose-p:font-light prose-p:leading-relaxed prose-p:my-4 
                      prose-strong:text-gray-800 prose-strong:font-medium 
                      prose-a:text-amber-600 prose-a:no-underline hover:prose-a:text-amber-700 prose-a:transition-colors 
                      prose-li:text-gray-700 prose-li:font-light prose-li:my-1 
                      prose-img:rounded-lg prose-img:border prose-img:border-gray-100"
                      dangerouslySetInnerHTML={{ __html: removeH2TitleFromContent(section.content) }}
                    />
                  </section>
                ))}
              </div>
            ) : (
              // Eğer içindekiler tablosu yoksa, içeriği tek parça olarak göster
              <div 
                className="prose prose-lg max-w-none 
                prose-headings:text-gray-800 prose-headings:font-light prose-headings:mt-10 prose-headings:mb-5 
                prose-h2:text-2xl prose-h3:text-xl 
                prose-p:text-gray-700 prose-p:font-light prose-p:leading-relaxed prose-p:my-4 
                prose-strong:text-gray-800 prose-strong:font-medium 
                prose-a:text-amber-600 prose-a:no-underline hover:prose-a:text-amber-700 prose-a:transition-colors 
                prose-li:text-gray-700 prose-li:font-light prose-li:my-1 
                prose-img:rounded-lg prose-img:border prose-img:border-gray-100"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}
            
            {/* Etiketler */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-16 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link 
                    key={tag.id} 
                    href={`/blog/etiket/${tag.slug}`}
                    className="px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-full hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all duration-300"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
            
            
          </div>
        </div>
      </article>
      
      {/* İlişkili Yazılar */}
      {post.related_posts && post.related_posts.length > 0 && (
        <div className="max-w-6xl mx-auto mt-32 mb-10">
          <h2 className="text-2xl font-light text-gray-800 mb-12 pb-4 border-b border-gray-100">İlişkili Yazılar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {post.related_posts.map((relatedPost) => (
              <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.id} className="block group">
                <article className="bg-white border border-gray-100 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md group flex flex-col" style={{ height: '500px' }}>
                  <div className="relative h-56 overflow-hidden">
                    <Image 
                      src={relatedPost.featured_image} 
                      alt={relatedPost.title}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-7 flex flex-col flex-grow">
                    {relatedPost.categories && relatedPost.categories.length > 0 && (
                      <span className="inline-block text-xs font-medium text-amber-600 mb-3 uppercase tracking-wider">
                        {relatedPost.categories[0].name}
                      </span>
                    )}
                    <h3 className="text-xl font-light text-gray-800 leading-tight group-hover:text-amber-600 transition-colors duration-300 line-clamp-2 h-14 overflow-hidden mb-3">
                      {relatedPost.title}
                    </h3>
                    <div className="text-gray-600 mb-5 font-light leading-relaxed flex-grow h-20 overflow-hidden">
                      <p className="line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-xs text-gray-500">
                        {new Date(relatedPost.published_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <span className="text-amber-600 font-medium text-sm group-hover:text-amber-700 transition-colors duration-300">Oku →</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 