
import blogService from '@/services/blogService';
import BlogHomeClient from '@/components/blog/BlogHomeClient';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';




export default async function BlogPage({ searchParams }) {
  try {
    // Sayfa numarası URL'den alınır, varsayılan olarak 1
    const currentPage = parseInt(searchParams?.page) || 1;
    

    
    // İlk sayfada öne çıkan yazıyı kontrol etmek için önce featured post'u çekelim
    let featuredPost = null;
    featuredPost = await blogService.getSingleFeaturedPost();

    
    // İlk sayfada featured post varsa 4 yazı çek (featured post filtrelenirse 3 kalacak)
    // Diğer sayfalarda normal 3 yazı çek
    let pageSize = 3;
    if (currentPage === 1 && featuredPost) {
      pageSize = 4; // İlk sayfada ekstra yazı çek
    }
    
    // Normal blog yazılarını çek - dinamik sayıda yazı al
    const postsData = await blogService.getAllPosts(currentPage, { 
      ordering: '-published_at',
      page_size: pageSize
    });
    
    // Kategorileri çek
    const categoriesData = await blogService.getCategories();
    
  
    
    // posts dizisini kontrol et ve oluştur
    let posts = [];
    let pagination = null;
    
    if (postsData && postsData.results && Array.isArray(postsData.results)) {
      posts = postsData.results;
      
      // Sayfalama bilgilerini al (her zaman 3 yazı basis'inde hesapla)
      pagination = {
        count: postsData.count || 0,
        next: postsData.next,
        previous: postsData.previous,
        currentPage: currentPage,
        totalPages: Math.ceil((postsData.count || 0) / 3),
        pageSize: 3
      };
      
 
      
      // Öne çıkan yazıyı normal yazı listesinden çıkar (eğer aynı yazı ise)
      if (featuredPost) {
     
        
        const filteredPosts = posts.filter(post => post.id !== featuredPost.id);
        
        if (filteredPosts.length < posts.length) {
        
          posts = filteredPosts;
          
          // İlk sayfada maksimum 3 yazı göster
          if (currentPage === 1 && posts.length > 3) {
            posts = posts.slice(0, 3);
          }
        }
      }
      
   
    } else {
      console.warn('API\'den beklenen formatta blog yazısı alınamadı:', { 
        postsData,
        hasResults: postsData?.results ? 'evet' : 'hayır',
        isArray: postsData?.results ? Array.isArray(postsData.results) : 'results yok'
      });
    }
    
    // Kategorileri kontrol et
    const categories = (categoriesData && categoriesData.results && 
                       Array.isArray(categoriesData.results)) ? 
                       categoriesData.results : [];
    
    
    // Geçersiz sayfa numarası kontrolü
    if (currentPage > 1 && posts.length === 0 && pagination && pagination.totalPages < currentPage) {
      return notFound();
    }
    
    // Veri yok durumu
    if (!featuredPost && (!posts || posts.length === 0) && currentPage === 1) {

      return (
        <div className="flex flex-col sm:flex-col-reverse">
      
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-16 pt-4 sm:pt-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 relative">
            <span className="relative inline-block">
              Blog
              <span className="absolute -bottom-3 left-0 right-0 h-1.5 bg-orange-400 rounded-full"></span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Blog yazılarımızı okuyun.
           
          </p>
        </motion.div>
      </div>
      );
    }
    

    return <BlogHomeClient 
      featuredPost={featuredPost} 
      posts={posts} 
      categories={categories} 
      pagination={pagination}
    />;
    
  } catch (error) {
    
    
    return (
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center py-10 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Hata!</h2>
          <p className="text-gray-700 mb-4">Blog verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
          <details className="text-left text-sm bg-white p-4 rounded-lg">
            <summary className="cursor-pointer font-medium mb-2">Teknik Detaylar</summary>
            <div className="whitespace-pre-wrap font-mono text-xs">
              {error.toString()}
              {error.stack && <div className="mt-2">{error.stack}</div>}
            </div>
          </details>
        </div>
      </div>
    );
  }
} 