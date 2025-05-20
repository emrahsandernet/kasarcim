export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/']
    },
    sitemap: 'https://kasarcim.com/sitemap.xml'
  }
} 