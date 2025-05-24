export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/km-admin/', '/admin/']
    },
    sitemap: 'https://kasarcim.com/sitemap/sitemap.xml'
  }
} 