import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../hooks/useCart';
import { WishlistProvider } from '../hooks/useWishlist';
import { ThemeProvider } from '../hooks/useTheme';
import { Preloader } from '../components/ui/Preloader';
import { AdminDataProvider } from '../hooks/AdminContext';
import { VisitorTracker } from '../components/common/VisitorTracker';
import { OrganizationJsonLd, WebSiteJsonLd } from '../components/seo/JsonLd';
import { GoogleAnalytics } from '../components/analytics/GoogleAnalytics';
import { SITE_URL, BRAND_NAME, generateOpenGraph, generateTwitter } from '../config/seoConfig';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'REXBEBE | Luxury Baby & Toddler Boutique Online',
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    'Curated organic cashmere rompers, French flax linen swaddles, handcrafted wooden nursery toys, and pastel baby clothes online at REXBEBE.',
  keywords: [
    'baby clothes',
    'luxury baby clothes',
    'newborn baby clothes',
    'organic baby romper',
    'baby boy clothes',
    'baby girl clothes and dresses',
    'cashmere baby clothing',
    'linen baby swaddles',
    'REXBEBE',
  ],
  authors: [{ name: BRAND_NAME, url: SITE_URL }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: generateOpenGraph({
    title: 'REXBEBE | Luxury Baby & Toddler Boutique Online',
    description:
      'Curated organic cashmere rompers, French flax linen swaddles, handcrafted wooden nursery toys, and pastel baby clothes online at REXBEBE.',
    url: SITE_URL,
    image: '/images/hero/world_bg.jpg',
  }),
  twitter: generateTwitter({
    title: 'REXBEBE | Luxury Baby & Toddler Boutique Online',
    description:
      'Curated organic cashmere rompers, French flax linen swaddles, handcrafted wooden nursery toys, and pastel baby clothes online at REXBEBE.',
    image: '/images/hero/world_bg.jpg',
  }),
  icons: {
    icon: [
      { url: '/images/logo_clean.png' },
      { url: '/images/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logo_clean.png', sizes: '180x180' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-[#FAF9F6] text-slate-800 dark:bg-[#0F172A] dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          <GoogleAnalytics />
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
