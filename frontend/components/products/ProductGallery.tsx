'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '../../types/product';

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [selectedImage, setSelectedImage] = useState(images[0]?.url || '/images/products/organic-onesie.jpg');

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-brand-50 border border-stone-100 shadow-sm">
        <Image
          src={selectedImage}
          alt="Product View"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(img.url)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                selectedImage === img.url ? 'border-brand-600 ring-2 ring-brand-200' : 'border-stone-200 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt={img.alt || 'Thumbnail'} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
