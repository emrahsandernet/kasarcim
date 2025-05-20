export default async function sitemap() {
  const currentDate = new Date();
  
  // Ana sayfa ve statik sayfalar
  const staticPages = [
    {
      url: 'https://kasarcim.com',
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: 'https://kasarcim.com/urunler',
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: 'https://kasarcim.com/hakkimizda',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: 'https://kasarcim.com/iletisim',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ];

  // Ürünleri API'den çekerek dinamik sitemap oluştur
  let products = [];
  try {
    const response = await fetch('https://kasarcim.com/urunler/api/products/');
    if (response.ok) {
      const data = await response.json();
      
      // Ürün detay sayfaları için sitemap girdileri oluştur
      products = data.map(product => ({
        url: `https://kasarcim.com/urunler/${product.slug}`,
        lastModified: new Date(product.updated_at || currentDate),
        changeFrequency: 'weekly',
        priority: 0.7
      }));
    }
  } catch (error) {
    console.error('Sitemap oluşturulurken ürünler çekilemedi:', error);
  }

  return [...staticPages, ...products];
} 