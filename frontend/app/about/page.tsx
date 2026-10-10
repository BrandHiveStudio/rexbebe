import React from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { BrandStory } from '../../components/home/BrandStory';
import { WhyRexbebe } from '../../components/home/WhyRexbebe';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-20 bg-brand-50 text-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-600">Our Heritage</span>
          <h1 className="font-serif text-4xl sm:text-5xl text-stone-900 font-normal mt-2">The REXBEBE Legacy</h1>
          <p className="text-stone-600 text-sm font-light max-w-lg mx-auto mt-4 leading-relaxed">
            Crafting pure organic luxury for little miracles with ethical Scandinavian design and Mongolian cashmere.
          </p>
        </section>
        <BrandStory />
        <WhyRexbebe />
      </main>
      <Footer />
    </>
  );
}
