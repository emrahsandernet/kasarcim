import Image from 'next/image';
import Link from 'next/link';
import { FaRegClock, FaRegCalendarAlt, FaRegUser, FaChevronRight } from 'react-icons/fa';
import blogService from '@/services/blogService';
import BlogPostClient from '@/components/blog/BlogPostClient';

// Okuma süresini hesapla
function calculateReadingTime(content) {
  const wordsPerMinute = 200; // Ortalama okuma hızı
  const wordCount = content?.trim().split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
}



// İçindekiler tablosu oluştur
function generateTableOfContents(sections) {
  if (!sections || sections.length === 0) return [];
  
  // Önce H2 seviyesindeki başlıkları filtrele ve sırala
  const h2Sections = sections
    .filter(section => section.level === 2)
    .sort((a, b) => a.order - b.order);
  
  return h2Sections;
}

// Sayfa metadata fonksiyonu
export async function generateMetadata({ params }) {
  try {
    // Slug'a göre blog yazısını getir
    const post = await blogService.getPostBySlug(params.slug);
    
    // Etiketlerden keywords oluştur
    const keywords = post.tags ? post.tags.map(tag => tag.name).join(', ') : '';
    const categoryName = post.categories && post.categories.length > 0 ? post.categories[0].name : '';
    
    // Tam keywords listesi
    const fullKeywords = [
      keywords,
      categoryName,
      'kaşarcım',
      'peynir',
      'organik peynir',
      'geleneksel peynir',
      'sağlıklı beslenme',
      'blog'
    ].filter(Boolean).join(', ');
    
    // Canonical URL
    const canonicalUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://kasarcim.com'}/blog/${params.slug}`;
    
    return {
      title: `${post.title} - Kaşarcım Blog`,
      description: post.meta_description || post.excerpt,
      keywords: fullKeywords,
      authors: [{ name: post.author_name || 'Kaşarcım' }],
      creator: post.author_name || 'Kaşarcım',
      publisher: 'Kaşarcım',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${post.title} - Kaşarcım Blog`,
        description: post.meta_description || post.excerpt,
        url: canonicalUrl,
        siteName: 'Kaşarcım',
        locale: 'tr_TR',
        type: 'article',
        publishedTime: post.published_at,
        modifiedTime: post.updated_at,
        authors: [post.author_name || 'Kaşarcım'],
        section: categoryName,
        tags: post.tags ? post.tags.map(tag => tag.name) : [],
        images: [
          {
            url: post.featured_image,
            width: 1200,
            height: 630,
            alt: post.title,
            type: 'image/jpeg',
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.title} - Kaşarcım Blog`,
        description: post.meta_description || post.excerpt,
        creator: '@kasarcim',
        site: '@kasarcim',
        images: [post.featured_image],
      },
      other: {
        'article:published_time': post.published_at,
        'article:modified_time': post.updated_at,
        'article:author': post.author_name || 'Kaşarcım',
        'article:section': categoryName,
        'article:tag': post.tags ? post.tags.map(tag => tag.name).join(',') : '',
      }
    };
  } catch (error) {
    console.error('Metadata oluşturulurken hata:', error);
    return {
      title: 'Yazı Bulunamadı - Kaşarcım Blog',
      description: 'Aradığınız blog yazısı bulunamadı.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function BlogPost({ params }) {
  try {
    // Slug'a göre blog yazısını getir
    const post = await blogService.getPostBySlug(params.slug);

    
    if (!post) {
      return (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Yazı Bulunamadı</h1>
            <p className="text-gray-600 mb-8">Aradığınız blog yazısı bulunamadı veya kaldırılmış olabilir.</p>
            <Link 
              href="/blog"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition duration-200"
            >
              Blog Ana Sayfasına Dön
            </Link>
          </div>
        </div>
      );
    }
    
    // İçindekiler tablosunu oluştur
    const tableOfContents = generateTableOfContents(post.sections);
    
    return <BlogPostClient post={post} tableOfContents={tableOfContents} />;
    
  } catch (error) {
    console.error(`Blog yazısı yüklenirken hata oluştu:`, error);
    
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Hata Oluştu</h1>
          <p className="text-gray-600 mb-8">Blog yazısı yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
          <Link 
            href="/blog"
            className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition duration-200"
          >
            Blog Ana Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }
} 