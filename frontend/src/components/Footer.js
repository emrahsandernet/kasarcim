"use client";

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-orange-500 mb-4">
              <Image
                src="/images/kasarcim-logo.svg"
                alt="Kaşarcım Logo"
                width={150}
                height={50}
                className="h-8 w-auto mb-2 text-orange-500"
              
              />
            </h3>
            <p className="text-gray-300 mb-4">
              Türkiye'nin En İyi E-Ticaret Sitesi. Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" aria-label="Facebook" className="text-gray-300 hover:text-orange-500">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" aria-label="Twitter" className="text-gray-300 hover:text-orange-500">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="text-gray-300 hover:text-orange-500">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="text-gray-300 hover:text-orange-500">
                <FaLinkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-orange-500 mb-4">Hızlı Erişim</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-orange-500">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/urunler" className="text-gray-300 hover:text-orange-500">
                  Ürünler
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-orange-500">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="text-gray-300 hover:text-orange-500">
                  Hakkımızda
                </Link>
              </li>
             
              <li>
                <Link href="/iletisim" className="text-gray-300 hover:text-orange-500">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-orange-500 mb-4">Müşteri Hizmetleri</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sikca-sorulan-sorular" className="text-gray-300 hover:text-orange-500">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/kargo-ve-teslimat" className="text-gray-300 hover:text-orange-500">
                  Kargo ve Teslimat
                </Link>
              </li>
            
              <li>
                <Link href="/gizlilik-politikasi" className="text-gray-300 hover:text-orange-500">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="text-gray-300 hover:text-orange-500">
                  Kullanım Koşulları
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-orange-500 mb-4">İletişim</h3>
            <address className="not-italic text-gray-300 space-y-2">
              <p>Güleser Sk. Hüseyin Apt.</p>
              <p>No: 4, Kat: 4</p>
              <p>Çekmeköy / İstanbul, Türkiye</p>
              <p className="mt-4">
                <a href="tel:+905369886912" className="hover:text-orange-500">
                  +90 (536) 988 69 12
                </a>
              </p>
              <p>
                <a href="mailto:info@kasarcim.com" className="hover:text-orange-500">
                  info@kasarcim.com
                </a>
              </p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} kasarcim. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
} 