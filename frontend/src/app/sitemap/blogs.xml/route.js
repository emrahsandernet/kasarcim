export async function GET() {
    const res = await fetch('http://localhost:8000/api/blog/posts/');
    const data = await res.json();
  
    const urls = data.map(blog => `
      <url>
        <loc>https://kasarcim.com/blog/${blog.slug}</loc>
        <lastmod>${blog.updated_at || blog.created_at}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
      </url>`).join('');
  
    const body = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
  </urlset>`;
  
    return new Response(body, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }