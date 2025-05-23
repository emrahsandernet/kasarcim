"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import AnnouncementBar from './AnnouncementBar';
import WhatsAppButton from './WhatsAppButton';
import CartDrawer from './CartDrawer';
import { useCart } from '@/context/CartContext';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/odeme';
  const { isDrawerOpen, closeDrawer } = useCart();

  if (isCheckoutPage) {
    // Ödeme sayfası için minimal layout
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // Normal sayfalar için tam layout
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
     
      <WhatsAppButton />
     <CartDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </div>
  );
} 