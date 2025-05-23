export async function GET() {
  const res = await fetch('https://kasarcim.com/api/products');
  const data = await res.json();

  const urls = data.map(product => `
    <url>
      <loc>https://kasarcim.com/urunler/${product.slug}</loc>
      <lastmod>${product.updated_at || product.created_at}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
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