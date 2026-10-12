import React from 'react';
import './globals.css';
import { CartProvider } from '../hooks/useCart';
import { WishlistProvider } from '../hooks/useWishlist';
import { ThemeProvider } from '../hooks/useTheme';
import { Preloader } from '../components/ui/Preloader';

import { AdminDataProvider } from '../hooks/AdminContext';
import { VisitorTracker } from '../components/common/VisitorTracker';

export const metadata = {
  title: 'REXBEBE | Luxury Baby & Toddler Boutique',
  description: 'Curated organic cashmere rompers, French flax linen swaddles, and handcrafted wooden nursery toys.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col justify-between bg-[#FAF9F6] text-slate-800 dark:bg-[#0F172A] dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          <Preloader />
          <AdminDataProvider>
            <VisitorTracker />
            <CartProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </CartProvider>
          </AdminDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
