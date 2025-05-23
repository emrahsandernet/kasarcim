export async function GET() {
    const body = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
      <loc>https://kasarcim.com/sitemap/pages.xml</loc>
    </sitemap>
    <sitemap>
      <loc>https://kasarcim.com/sitemap/products.xml</loc>
    </sitemap>
    <sitemap>
      <loc>https://kasarcim.com/sitemap/blogs.xml</loc>
    </sitemap>
  </sitemapindex>`;
  
    return new Response(body, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }