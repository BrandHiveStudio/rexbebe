import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/home/Hero';
import { CategorySection } from '../components/home/CategorySection';
import { BestSellers } from '../components/home/BestSellers';
import { NewArrivals } from '../components/home/NewArrivals';
import { LittleEssentials } from '../components/home/LittleEssentials';
import { TheLittleEdit } from '../components/home/TheLittleEdit';
import { BrandStory } from '../components/home/BrandStory';
import { FeaturedCollection } from '../components/home/FeaturedCollection';
import { WhyRexbebe } from '../components/home/WhyRexbebe';
import { CustomerReviews } from '../components/home/CustomerReviews';
import { Newsletter } from '../components/home/Newsletter';
import { InstagramSection } from '../components/home/InstagramSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden bg-gradient-to-b from-[#FAF9F6] via-[#FDF2F8]/30 via-[#ECFDF5]/20 to-[#FAF9F6]">
        {/* 1. Animated Hero World */}
        <Hero />

        {/* 2. Shop the Little World (Circular & Floating Categories) */}
        <CategorySection />

        {/* 3. Featured Little Favorites (Parent Favorites) */}
        <BestSellers />

        {/* 4. New Arrivals Showcase */}
        <NewArrivals />

        {/* 5. Editorial Section: Little Essentials */}
        <LittleEssentials />

        {/* 6. Editorial Section: The Little Edit */}
        <TheLittleEdit />

        {/* 7. Lifestyle & Story: Little Days. Big Memories. */}
        <BrandStory />

        {/* 8. Special Campaign: For Little Adventures */}
        <FeaturedCollection />

        {/* 9. Trust & Services Bar */}
        <WhyRexbebe />

        {/* 10. Customer Reviews */}
        <CustomerReviews />

        {/* 11. Newsletter Registration */}
        <Newsletter />

        {/* 12. Instagram / Social Feed */}
        <InstagramSection />
      </main>
      <Footer />
    </>
  );
}

