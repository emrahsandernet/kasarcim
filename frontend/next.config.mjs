/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.43',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.kasarcim.com',
        pathname: '/**', // ✔️ Tüm dizinleri kapsar
      },
    ],
  },
  experimental: {
    // Diğer deneysel özellikler burada olabilir
  },
  // Sunucu bileşenleri için harici paketler
  serverExternalPackages: ['axios'],
  // API isteklerine izin ver
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://web:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;