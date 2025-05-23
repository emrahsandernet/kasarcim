import Script from "next/script"; // <-- Bunu en üste ekle
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { LoaderProvider } from '@/context/LoaderContext';
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Toaster } from 'react-hot-toast';
import LayoutWrapper from '@/components/LayoutWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://www.kasarcim.com"),
  title: "Kaşarcım - Türkiye'nin En Lezzetli ve Organik Kaşar Peyniri",
  description: "Türkiye'nin en kaliteli ve organik peynir çeşitleri, lezzetli kaşar peynirleri ve süt ürünleri",
  images: [
    {
      url: "https://www.kasarcim.com/images/kasar-hero.png",
      width: 1200,
      height: 630,
      alt: "Kaşarcım"
    }
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  openGraph: {
    title: "Kaşarcım - Türkiye'nin En Lezzetli ve Organik Kaşar Peyniri",
    description: "Doğal süt ve geleneksel yöntemlerle üretilen eşsiz tadıyla peynir çeşitleri. Sizin için özenle hazırlanıp gönderiliyor.",
    images: [
      {
        url: "https://cdn.kasarcim.com/727b287e1370e7bc_logo.png",
        width: 1200,
        height: 630,
        alt: "Kaşarcım"
      }
    ],
    type: "website",
    locale: "tr_TR",
    siteName: "Kaşarcım"
  },
  icons: {
    icon: "/images/kasarcim-logo-icon.svg",
    shortcut: "/images/kasarcim-logo-icon.svg",
    apple: "/images/kasarcim-logo-icon.svg",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Kaşarcım - Türkiye'nin En Lezzetli ve Organik Kaşar Peyniri",
    statusBarStyle: "default",
    capable: true,
  },
  mobileApp: true,
  mobileAppIOS: true,
  mobileAppAndroid: true,
  twitter: {
    card: "summary_large_image",
    site: "@kasarcim",
    creator: "@kasarcim",
    title: "Kaşarcım - Türkiye'nin En Lezzetli Kaşar Peyniri",
    description: "Organik süt ve geleneksel yöntemlerle üretilen eşsiz tadıyla peynir çeşitleri. Sizin için özenle hazırlanıp gönderiliyor.",
    images: [
      {
        url: "https://cdn.kasarcim.com/727b287e1370e7bc_logo.png",
        width: 1200,
        height: 630,
        alt: "Kaşarcım"
      }
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        {/* Structured Data (senin zaten eklediğin) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Kaşarcım",
              url: "https://www.kasarcim.com",
              logo: "https://cdn.kasarcim.com/727b287e1370e7bc_logo.png",
              sameAs: [
                "https://facebook.com/kasarcim",
                "https://instagram.com/kasarcim",
                "https://twitter.com/kasarcim"
              ]
            }),
          }}
        />
       
       
      <Script id="gtm-head" strategy="beforeInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-N7S4XTD8');`}
      </Script>


       
      </head>
      <body className={inter.className}>
      <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N7S4XTD8"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <AuthProvider>
          <CartProvider>
            <LoaderProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </LoaderProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#FFF8F1",
                  color: "#333333",
                  boxShadow: "0 10px 20px rgba(255, 107, 0, 0.15)",
                  padding: "16px 20px",
                  minWidth: "320px",
                  maxWidth: "420px",
                  fontSize: "0.925rem",
                  borderRadius: "12px",
                  border: "1px solid #FFE8D8",
                  transition: "all 0.3s ease",
                },
                success: {
                  style: {
                    background: "linear-gradient(to right, #FFF7ED, #FFF8F1)",
                    borderLeft: "5px solid #FF6B00",
                  },
                  iconTheme: {
                    primary: "#FF6B00",
                    secondary: "#FFFFFF",
                  },
                },
                error: {
                  style: {
                    background: "linear-gradient(to right, #FEF2F2, #FFF1F1)",
                    borderLeft: "5px solid #EF4444",
                  },
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "#FFFFFF",
                  },
                },
                loading: {
                  style: {
                    background: "linear-gradient(to right, #FFF7ED, #FFF8F1)",
                    borderLeft: "5px solid #FF8C55",
                  },
                  iconTheme: {
                    primary: "#FF8C55",
                    secondary: "#FFFFFF",
                  },
                },
                custom: {
                  style: {
                    background: "linear-gradient(to right, #FFF7ED, #FFF8F1)",
                    borderLeft: "5px solid #FF6B00",
                  },
                  iconTheme: {
                    primary: "#FF6B00",
                    secondary: "#FFFFFF",
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}