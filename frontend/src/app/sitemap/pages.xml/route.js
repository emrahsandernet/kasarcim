export async function GET() {
    const urls = [
      { loc: 'https://kasarcim.com/', priority: 1.0 },
      { loc: 'https://kasarcim.com/urunler', priority: 0.9 },
      { loc: 'https://kasarcim.com/hakkimizda', priority: 0.8 },
      { loc: 'https://kasarcim.com/iletisim', priority: 0.8 },
      { loc: 'https://kasarcim.com/blog', priority: 0.9 }
    ];
  
    const body = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(u => `
    <url>
      <loc>${u.loc}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>${u.priority}</priority>
    </url>`).join('')}
  </urlset>`;
  
    return new Response(body, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }