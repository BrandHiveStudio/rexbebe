import { Product } from '../types/product';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-dino-baby-set',
    name: 'REXBEBE Dino Adventure 3-Piece Baby Set',
    slug: 'dino-adventure-baby-set',
    sku: 'REX-DINO-SET',
    shortDescription: 'Luxury 3-piece baby clothing set featuring our signature dinosaur print T-shirt, matching shorts, and sun hat.',
    description: 'Crafted from 100% GOTS certified ultra-soft organic cotton, the Dino Adventure 3-Piece Set is tailored for pure comfort and heirloom style. Includes a playful dinosaur print T-shirt, stretch-waist shorts, and matching sun hat. Designed for gentle dressing with nickel-free snaps and baby-safe dyes.',
    price: 14500,
    comparePrice: 17500,
    discountPercentage: 17,
    productType: 'set',
    status: 'published',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isSaleBadge: true,
    brand: 'REXBEBE Atelier',
    gender: 'Baby',
    ageGroup: '0–12 months',
    category: { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing' },
    images: [
      { id: 'img-dino-main-red', url: '/images/products/dino-baby-set.jpg', alt: 'REXBEBE Dino Adventure Baby Set - Red T-Shirt', position: 1, colorName: 'Red' },
      { id: 'img-dino-main-yellow', url: '/images/products/dino-baby-set-yellow.jpg', alt: 'REXBEBE Dino Adventure Baby Set - Yellow T-Shirt Variation', position: 2, colorName: 'Yellow' },
      { id: 'img-dino-main-blue', url: '/images/products/dino-baby-set-blue.jpg', alt: 'REXBEBE Dino Adventure Baby Set - Blue T-Shirt Variation', position: 3, colorName: 'Blue' }
    ],
    colors: [
      { name: 'Red', hex: '#EF4444' },
      { name: 'Yellow', hex: '#F59E0B' },
      { name: 'Blue', hex: '#3B82F6' }
    ],
    sizes: ['0–3 Months', '3–6 Months', '6–9 Months'],
    parts: [
      {
        id: 'part-tshirt',
        name: 'Dinosaur T-Shirt',
        type: 'T-shirt',
        description: 'Base organic cotton tee with hand-illustrated colorful dinosaur graphic',
        defaultColor: 'Red',
        active: true,
        isPurchasableIndividually: true,
        price: 6500,
        comparePrice: 7500,
        skuPrefix: 'REX-DINO-TEE',
        sizes: ['0–3 Months', '3–6 Months', '6–9 Months'],
        colors: [
          { name: 'Red', hex: '#EF4444' },
          { name: 'Yellow', hex: '#F59E0B' },
          { name: 'Blue', hex: '#3B82F6' }
        ],
        images: [
          { id: 'part-img-red', url: '/images/products/dino-baby-set.jpg', colorName: 'Red', alt: 'Red Dinosaur T-Shirt' },
          { id: 'part-img-yellow', url: '/images/products/dino-baby-set-yellow.jpg', colorName: 'Yellow', alt: 'Yellow Dinosaur T-Shirt', isRecolored: true },
          { id: 'part-img-blue', url: '/images/products/dino-baby-set-blue.jpg', colorName: 'Blue', alt: 'Blue Dinosaur T-Shirt', isRecolored: true }
        ]
      },
      {
        id: 'part-shorts',
        name: 'Summer Shorts',
        type: 'Shorts',
        description: 'Neutral beige stretch-waist shorts tailored for gentle movement',
        defaultColor: 'Beige',
        active: true,
        isPurchasableIndividually: true,
        price: 4500,
        comparePrice: 5200,
        skuPrefix: 'REX-DINO-SHORTS',
        sizes: ['0–3 Months', '3–6 Months', '6–9 Months'],
        colors: [{ name: 'Beige', hex: '#E7D8C9' }],
        images: [
          { id: 'part-img-shorts-beige', url: '/images/products/dino-baby-set.jpg', colorName: 'Beige', alt: 'Beige Summer Shorts' }
        ]
      },
      {
        id: 'part-hat',
        name: 'Baby Hat',
        type: 'Hat',
        description: 'Matching baby sun hat for sunny outings',
        defaultColor: 'Red',
        active: true,
        isPurchasableIndividually: true,
        price: 3500,
        comparePrice: 4000,
        skuPrefix: 'REX-DINO-HAT',
        sizes: ['One Size'],
        colors: [{ name: 'Red', hex: '#EF4444' }],
        images: [
          { id: 'part-img-hat-red', url: '/images/products/dino-baby-set.jpg', colorName: 'Red', alt: 'Red Baby Sun Hat' }
        ]
      }
    ],
    variants: [
      // Complete Outfit Variants (3-Piece Sets)
      { id: 'var-dino-03m-red', sku: 'REX-DINO-03M-RED', purchaseType: 'complete_set', size: '0–3 Months', color: 'Red', colorHex: '#EF4444', partColors: { 'Dinosaur T-Shirt': 'Red', 'Summer Shorts': 'Beige', 'Baby Hat': 'Red' }, price: 14500, stockQuantity: 5, imageUrl: '/images/products/dino-baby-set.jpg' },
      { id: 'var-dino-03m-yel', sku: 'REX-DINO-03M-YEL', purchaseType: 'complete_set', size: '0–3 Months', color: 'Yellow', colorHex: '#F59E0B', partColors: { 'Dinosaur T-Shirt': 'Yellow', 'Summer Shorts': 'Beige', 'Baby Hat': 'Red' }, price: 14500, stockQuantity: 3, imageUrl: '/images/products/dino-baby-set-yellow.jpg' },
      { id: 'var-dino-03m-blu', sku: 'REX-DINO-03M-BLU', purchaseType: 'complete_set', size: '0–3 Months', color: 'Blue', colorHex: '#3B82F6', partColors: { 'Dinosaur T-Shirt': 'Blue', 'Summer Shorts': 'Beige', 'Baby Hat': 'Red' }, price: 14500, stockQuantity: 0, imageUrl: '/images/products/dino-baby-set-blue.jpg' },
      { id: 'var-dino-36m-red', sku: 'REX-DINO-36M-RED', purchaseType: 'complete_set', size: '3–6 Months', color: 'Red', colorHex: '#EF4444', partColors: { 'Dinosaur T-Shirt': 'Red', 'Summer Shorts': 'Beige', 'Baby Hat': 'Red' }, price: 14500, stockQuantity: 8, imageUrl: '/images/products/dino-baby-set.jpg' },
      { id: 'var-dino-36m-yel', sku: 'REX-DINO-36M-YEL', purchaseType: 'complete_set', size: '3–6 Months', color: 'Yellow', colorHex: '#F59E0B', partColors: { 'Dinosaur T-Shirt': 'Yellow', 'Summer Shorts': 'Beige', 'Baby Hat': 'Red' }, price: 14500, stockQuantity: 0, imageUrl: '/images/products/dino-baby-set-yellow.jpg' },
      { id: 'var-dino-36m-blu', sku: 'REX-DINO-36M-BLU', purchaseType: 'complete_set', size: '3–6 Months', color: 'Blue', colorHex: '#3B82F6', partColors: { 'Dinosaur T-Shirt': 'Blue', 'Summer Shorts': 'Beige', 'Baby Hat': 'Red' }, price: 14500, stockQuantity: 4, imageUrl: '/images/products/dino-baby-set-blue.jpg' },
      { id: 'var-dino-69m-red', sku: 'REX-DINO-69M-RED', purchaseType: 'complete_set', size: '6–9 Months', color: 'Red', colorHex: '#EF4444', partColors: { 'Dinosaur T-Shirt': 'Red', 'Summer Shorts': 'Beige', 'Baby Hat': 'Red' }, price: 14500, stockQuantity: 2, imageUrl: '/images/products/dino-baby-set.jpg' },
      { id: 'var-dino-69m-yel', sku: 'REX-DINO-69M-YEL', purchaseType: 'complete_set', size: '6–9 Months', color: 'Yellow', colorHex: '#F59E0B', partColors: { 'Dinosaur T-Shirt': 'Yellow', 'Summer Shorts': 'Beige', 'Baby Hat': 'Red' }, price: 14500, stockQuantity: 6, imageUrl: '/images/products/dino-baby-set-yellow.jpg' },
      { id: 'var-dino-69m-blu', sku: 'REX-DINO-69M-BLU', purchaseType: 'complete_set', size: '6–9 Months', color: 'Blue', colorHex: '#3B82F6', partColors: { 'Dinosaur T-Shirt': 'Blue', 'Summer Shorts': 'Beige', 'Baby Hat': 'Red' }, price: 14500, stockQuantity: 7, imageUrl: '/images/products/dino-baby-set-blue.jpg' },

      // Individual Part: Dinosaur T-Shirt Variants
      { id: 'var-dino-part-tshirt-03m-red', sku: 'REX-DINO-TEE-03M-RED', purchaseType: 'individual_part', partId: 'part-tshirt', partName: 'Dinosaur T-Shirt', size: '0–3 Months', color: 'Red', colorHex: '#EF4444', price: 6500, stockQuantity: 8, imageUrl: '/images/products/dino-baby-set.jpg' },
      { id: 'var-dino-part-tshirt-03m-yel', sku: 'REX-DINO-TEE-03M-YEL', purchaseType: 'individual_part', partId: 'part-tshirt', partName: 'Dinosaur T-Shirt', size: '0–3 Months', color: 'Yellow', colorHex: '#F59E0B', price: 6500, stockQuantity: 5, imageUrl: '/images/products/dino-baby-set-yellow.jpg' },
      { id: 'var-dino-part-tshirt-03m-blu', sku: 'REX-DINO-TEE-03M-BLU', purchaseType: 'individual_part', partId: 'part-tshirt', partName: 'Dinosaur T-Shirt', size: '0–3 Months', color: 'Blue', colorHex: '#3B82F6', price: 6500, stockQuantity: 6, imageUrl: '/images/products/dino-baby-set-blue.jpg' },
      { id: 'var-dino-part-tshirt-36m-red', sku: 'REX-DINO-TEE-36M-RED', purchaseType: 'individual_part', partId: 'part-tshirt', partName: 'Dinosaur T-Shirt', size: '3–6 Months', color: 'Red', colorHex: '#EF4444', price: 6500, stockQuantity: 10, imageUrl: '/images/products/dino-baby-set.jpg' },
      { id: 'var-dino-part-tshirt-36m-yel', sku: 'REX-DINO-TEE-36M-YEL', purchaseType: 'individual_part', partId: 'part-tshirt', partName: 'Dinosaur T-Shirt', size: '3–6 Months', color: 'Yellow', colorHex: '#F59E0B', price: 6500, stockQuantity: 7, imageUrl: '/images/products/dino-baby-set-yellow.jpg' },
      { id: 'var-dino-part-tshirt-36m-blu', sku: 'REX-DINO-TEE-36M-BLU', purchaseType: 'individual_part', partId: 'part-tshirt', partName: 'Dinosaur T-Shirt', size: '3–6 Months', color: 'Blue', colorHex: '#3B82F6', price: 6500, stockQuantity: 8, imageUrl: '/images/products/dino-baby-set-blue.jpg' },
      { id: 'var-dino-part-tshirt-69m-red', sku: 'REX-DINO-TEE-69M-RED', purchaseType: 'individual_part', partId: 'part-tshirt', partName: 'Dinosaur T-Shirt', size: '6–9 Months', color: 'Red', colorHex: '#EF4444', price: 6500, stockQuantity: 6, imageUrl: '/images/products/dino-baby-set.jpg' },
      { id: 'var-dino-part-tshirt-69m-yel', sku: 'REX-DINO-TEE-69M-YEL', purchaseType: 'individual_part', partId: 'part-tshirt', partName: 'Dinosaur T-Shirt', size: '6–9 Months', color: 'Yellow', colorHex: '#F59E0B', price: 6500, stockQuantity: 4, imageUrl: '/images/products/dino-baby-set-yellow.jpg' },
      { id: 'var-dino-part-tshirt-69m-blu', sku: 'REX-DINO-TEE-69M-BLU', purchaseType: 'individual_part', partId: 'part-tshirt', partName: 'Dinosaur T-Shirt', size: '6–9 Months', color: 'Blue', colorHex: '#3B82F6', price: 6500, stockQuantity: 5, imageUrl: '/images/products/dino-baby-set-blue.jpg' },

      // Individual Part: Summer Shorts Variants
      { id: 'var-dino-part-shorts-03m-bei', sku: 'REX-DINO-SHORTS-03M-BEI', purchaseType: 'individual_part', partId: 'part-shorts', partName: 'Summer Shorts', size: '0–3 Months', color: 'Beige', colorHex: '#E7D8C9', price: 4500, stockQuantity: 12, imageUrl: '/images/products/dino-baby-set.jpg' },
      { id: 'var-dino-part-shorts-36m-bei', sku: 'REX-DINO-SHORTS-36M-BEI', purchaseType: 'individual_part', partId: 'part-shorts', partName: 'Summer Shorts', size: '3–6 Months', color: 'Beige', colorHex: '#E7D8C9', price: 4500, stockQuantity: 15, imageUrl: '/images/products/dino-baby-set.jpg' },
      { id: 'var-dino-part-shorts-69m-bei', sku: 'REX-DINO-SHORTS-69M-BEI', purchaseType: 'individual_part', partId: 'part-shorts', partName: 'Summer Shorts', size: '6–9 Months', color: 'Beige', colorHex: '#E7D8C9', price: 4500, stockQuantity: 10, imageUrl: '/images/products/dino-baby-set.jpg' },

      // Individual Part: Baby Hat Variants
      { id: 'var-dino-part-hat-onesize-red', sku: 'REX-DINO-HAT-RED', purchaseType: 'individual_part', partId: 'part-hat', partName: 'Baby Hat', size: 'One Size', color: 'Red', colorHex: '#EF4444', price: 3500, stockQuantity: 14, imageUrl: '/images/products/dino-baby-set.jpg' }
    ],
    stockQuantity: 35,
    lowStockThreshold: 5,
    stockStatus: 'in_stock',
    fabricMaterial: '100% GOTS Certified Organic Cotton Jersey',
    careInstructions: 'Gentle cold machine wash inside out. Do not tumble dry. Warm iron on reverse.',
    countryOfOrigin: 'Sri Lanka',
    weight: '210g',
    features: [
      '3-Piece complete heirloom baby clothing set',
      'Base fabric recolored while protecting vibrant dinosaur illustration',
      'Independent parts: T-Shirt, Summer Shorts, and matching Baby Hat',
      'Eco-certified non-toxic baby-safe inks'
    ],
    rating: 5,
    reviewCount: 12
  },
  {
    id: 'prod-1',
    name: 'Aurelia Organic Cashmere Romper',
    slug: 'aurelia-organic-cashmere-romper',
    sku: 'REX-AUREL-001',
    shortDescription: 'Handcrafted 100% GOTS certified Mongolian organic cashmere romper with pearl buttons.',
    description: 'Crafted from 100% GOTS certified organic Mongolian cashmere, the Aurelia romper offers unparalleled softness and delicate breathability for newborn skin. Features mother-of-pearl buttons and expandable envelope neckline for gentle everyday dressing.',
    price: 18500,
    comparePrice: 22000,
    discountPercentage: 16,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isSaleBadge: true,
    status: 'published',
    brand: 'REXBEBE Atelier',
    gender: 'Baby',
    ageGroup: '0–3 months',
    category: { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing' },
    subcategory: { id: 'sub-rompers', name: 'Rompers', slug: 'rompers' },
    collection: { id: 'coll-autumn', name: 'Autumn Atelier Collection', slug: 'autumn-atelier' },
    images: [
      { id: 'img-1', url: '/images/products/baby-girl-fashion.jpg', alt: 'Aurelia Organic Cashmere Romper in oatmeal tone', position: 1 },
      { id: 'img-2', url: '/images/products/hero-nursery.jpg', alt: 'Aurelia Romper Nursery View', position: 2 }
    ],
    variants: [
      { id: 'var-1a', sku: 'AUREL-OAT-03M', size: '0–3 Months', color: 'Baby Pink', colorHex: '#F9A8D4', price: 18500, stockQuantity: 25 },
      { id: 'var-1b', sku: 'AUREL-OAT-06M', size: '3–6 Months', color: 'Cream', colorHex: '#FEF3C7', price: 18500, stockQuantity: 18 },
      { id: 'var-1c', sku: 'AUREL-ROSE-03M', size: '6–12 Months', color: 'Warm Sand', colorHex: '#D4B895', price: 18500, stockQuantity: 12 }
    ],
    colors: [
      { name: 'Baby Pink', hex: '#F9A8D4' },
      { name: 'Cream', hex: '#FEF3C7' },
      { name: 'Warm Sand', hex: '#D4B895' }
    ],
    sizes: ['Newborn', '0–3 Months', '3–6 Months', '6–12 Months'],
    stockQuantity: 55,
    lowStockThreshold: 5,
    stockStatus: 'in_stock',
    fabricMaterial: '100% GOTS Certified Organic Mongolian Cashmere',
    careInstructions: 'Hand wash cold with delicate baby detergent. Dry flat in shade. Do not tumble dry. Warm iron if needed.',
    countryOfOrigin: 'Mongolia & Sri Lanka',
    weight: '165g',
    features: [
      '100% GOTS Certified Organic Mongolian Cashmere',
      'Natural freshwater mother-of-pearl buttons',
      'Envelope neck opening for effortless, gentle changes',
      'Hypoallergenic & anti-scratch seams'
    ],
    rating: 4.9,
    reviewCount: 42,
    reviewsList: [
      {
        id: 'rev-1',
        author: 'Sophie L.',
        location: 'Colombo, Sri Lanka 🇱🇰',
        rating: 5,
        date: 'October 2, 2026',
        title: 'Extremely soft organic cashmere!',
        content: 'I ordered this for my 4-month-old daughter and the quality surpassed my expectations. The organic cashmere feels like a cloud against baby skin. Washes beautifully with zero shrinkage.',
        verified: true,
        fit: 'True to Size'
      },
      {
        id: 'rev-2',
        author: 'Camilla M.',
        location: 'Kandy, Sri Lanka 🇱🇰',
        rating: 5,
        date: 'September 28, 2026',
        title: 'The perfect gift for our baby shower!',
        content: 'Packaged in the signature REXBEBE luxury ribbon box. Our guests were raving about how cute and soft it is. Will definitely be buying more from the Autumn Atelier collection.',
        verified: true,
        fit: 'Perfect Fit'
      }
    ],
    seoTitle: 'Aurelia Organic Cashmere Romper | Luxury Baby Clothing | REXBEBE',
    seoDescription: 'Discover the Aurelia 100% organic cashmere romper for newborns and babies. Heirloom luxury with mother-of-pearl buttons, delivered across Sri Lanka.'
  },
  {
    id: 'prod-2',
    name: 'Nordic Artisan Wooden Play Gym',
    slug: 'nordic-artisan-wooden-play-gym',
    sku: 'REX-GYM-002',
    shortDescription: 'Handcrafted sustainable beechwood baby activity gym with 3 hand-crocheted rattle toys.',
    description: 'Handcrafted from solid sustainable beechwood with organic unvarnished finish. Includes 3 detachable hand-crocheted sensory toys with subtle rattles to stimulate motor development and visual tracking.',
    price: 24500,
    comparePrice: 28000,
    discountPercentage: 13,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isSaleBadge: true,
    status: 'published',
    brand: 'REXBEBE Atelier',
    gender: 'Unisex',
    ageGroup: '0–3 months',
    category: { id: 'cat-toys', name: 'Nursery & Toys', slug: 'nursery-toys' },
    subcategory: { id: 'sub-gyms', name: 'Activity Gyms', slug: 'activity-gyms' },
    collection: { id: 'coll-nordic', name: 'Scandinavian Nursery', slug: 'scandinavian-nursery' },
    images: [
      { id: 'img-3', url: '/images/products/wooden-gym.jpg', alt: 'Nordic Wooden Play Gym natural beechwood frame', position: 1 }
    ],
    variants: [
      { id: 'var-2a', sku: 'GYM-WOOD-STD', size: 'One Size', color: 'Natural Beech', colorHex: '#D4B895', price: 24500, stockQuantity: 14 }
    ],
    colors: [
      { name: 'Natural Beech', hex: '#D4B895' }
    ],
    sizes: ['One Size'],
    stockQuantity: 14,
    lowStockThreshold: 3,
    stockStatus: 'in_stock',
    fabricMaterial: 'FSC Certified Natural Beechwood & Organic Cotton Crochet',
    careInstructions: 'Wipe clean with a damp cloth. Do not soak in water. Use organic wood wax once a year.',
    countryOfOrigin: 'Sri Lanka',
    weight: '1.8kg',
    features: [
      'FSC Certified sustainable European beechwood',
      'Non-toxic water-based food-grade baby-safe finish',
      'Foldable A-frame structure for easy storage',
      'Includes 3 hand-crocheted rattle accessories'
    ],
    rating: 5.0,
    reviewCount: 38,
    reviewsList: [
      {
        id: 'rev-3',
        author: 'Nayani P.',
        location: 'Galle, Sri Lanka 🇱🇰',
        rating: 5,
        date: 'September 15, 2026',
        title: 'Sturdy, aesthetic and baby loves it!',
        content: 'Fits beautifully in our modern nursery and my 2-month-old spends hours kicking and smiling at the little crochet rattles.',
        verified: true,
        fit: 'One Size'
      }
    ],
    seoTitle: 'Nordic Artisan Wooden Play Gym | Montessori Nursery Toys | REXBEBE',
    seoDescription: 'Handcrafted sustainable beechwood baby play gym with organic crochet sensory rattles. Perfect for baby development.'
  },
  {
    id: 'prod-3',
    name: 'Maison Luxe Organic Linen Set',
    slug: 'maison-luxe-organic-linen-swaddle-set',
    sku: 'REX-LIN-003',
    shortDescription: 'Triple-washed French flax linen shirt and shorts set with shell buttons.',
    description: 'Triple-washed French flax linen shirt and shorts set. Lightweight, thermoregulating, and grows softer with every wash. Complete with coconut buttons and elasticated waistband for total comfort.',
    price: 14200,
    comparePrice: 16500,
    discountPercentage: 14,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isSaleBadge: true,
    status: 'published',
    brand: 'REXBEBE Atelier',
    gender: 'Boys',
    ageGroup: '3–6 months',
    category: { id: 'cat-essentials', name: 'Bedding & Swaddles', slug: 'bedding-swaddles' },
    subcategory: { id: 'sub-linen-sets', name: 'Linen Sets', slug: 'linen-sets' },
    collection: { id: 'coll-autumn', name: 'Autumn Atelier Collection', slug: 'autumn-atelier' },
    images: [
      { id: 'img-4', url: '/images/products/baby-boy-fashion.jpg', alt: 'Maison Luxe Organic Linen Set in powder blue', position: 1 }
    ],
    variants: [
      { id: 'var-3a', sku: 'SWAD-BLUE-03M', size: '0–3 Months', color: 'Sky Blue', colorHex: '#BAE6FD', price: 14200, stockQuantity: 30 },
      { id: 'var-3b', sku: 'SWAD-CREAM-06M', size: '3–6 Months', color: 'Ivory Cream', colorHex: '#FDFBF7', price: 14200, stockQuantity: 22 }
    ],
    colors: [
      { name: 'Sky Blue', hex: '#BAE6FD' },
      { name: 'Ivory Cream', hex: '#FDFBF7' }
    ],
    sizes: ['0–3 Months', '3–6 Months', '6–12 Months', '1–2 Years'],
    stockQuantity: 52,
    lowStockThreshold: 5,
    stockStatus: 'in_stock',
    fabricMaterial: '100% French Flax Certified Organic Linen',
    careInstructions: 'Gentle machine wash with cold water. Line dry in shade. Iron slightly damp.',
    countryOfOrigin: 'France & Sri Lanka',
    weight: '190g',
    features: [
      'Thermoregulating natural linen keeps baby cool in warm weather',
      'Pre-washed with organic enzymes for ultra-soft hand feel',
      'Natural shell buttons with spare attached',
      'Gentle elastic waistband with no tight pinching'
    ],
    rating: 4.8,
    reviewCount: 29,
    reviewsList: [
      {
        id: 'rev-4',
        author: 'Anuki D.',
        location: 'Negombo, Sri Lanka 🇱🇰',
        rating: 5,
        date: 'September 18, 2026',
        title: 'Breathable linen, perfect for Sri Lankan climate!',
        content: 'The fabric is so light and airy, keeping our baby cool even during sunny afternoons. Definitely recommend!',
        verified: true,
        fit: 'True to Size'
      }
    ],
    seoTitle: 'Maison Luxe Organic Linen Set | REXBEBE Baby Clothing',
    seoDescription: 'Pure French flax linen two-piece shirt and shorts set for baby boys and girls. Ultra breathable and gentle on delicate baby skin.'
  },
  {
    id: 'prod-4',
    name: 'Celeste Convertible Ergonomic Stroller',
    slug: 'celeste-convertible-ergonomic-stroller',
    sku: 'REX-STR-004',
    shortDescription: 'High-landscape all-terrain modular luxury stroller with aluminum frame.',
    description: 'Modular high-landscape stroller with aircraft-grade aluminum frame, shock-absorbing all-terrain wheels, and eco-leather touchpoints. Suitable from birth to 22kg.',
    price: 189000,
    comparePrice: 210000,
    discountPercentage: 10,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isSaleBadge: true,
    status: 'published',
    brand: 'REXBEBE Atelier',
    gender: 'Unisex',
    ageGroup: 'Newborn',
    category: { id: 'cat-gear', name: 'Baby Gear & Travel', slug: 'gear-travel' },
    subcategory: { id: 'sub-strollers', name: 'Strollers', slug: 'strollers' },
    collection: { id: 'coll-travel', name: 'Travel Luxury Series', slug: 'travel-luxury' },
    images: [
      { id: 'img-5', url: '/images/products/hero-nursery.jpg', alt: 'Celeste Convertible Ergonomic Stroller', position: 1 }
    ],
    variants: [
      { id: 'var-4a', sku: 'STR-ONYX-GLD', size: 'Standard', color: 'Onyx Black', colorHex: '#1A1A1A', price: 189000, stockQuantity: 8 },
      { id: 'var-4b', sku: 'STR-SAND-SLV', size: 'Standard', color: 'Desert Sand', colorHex: '#C5B39B', price: 189000, stockQuantity: 5 }
    ],
    colors: [
      { name: 'Onyx Black', hex: '#1A1A1A' },
      { name: 'Desert Sand', hex: '#C5B39B' }
    ],
    sizes: ['Standard'],
    stockQuantity: 13,
    lowStockThreshold: 2,
    stockStatus: 'in_stock',
    fabricMaterial: 'Aviation Grade Aluminum Frame & Water-Repellent Eco-Fabric',
    careInstructions: 'Spot clean fabric with mild baby-safe soap. Wipe aluminum frame dry.',
    countryOfOrigin: 'Germany',
    weight: '8.5kg',
    features: [
      'Ultra-compact one-hand folding mechanism',
      '4-wheel independent shock suspension',
      'Reversible bassinet seat: parent-facing or world-facing',
      'UPF50+ extendable canopy with peekaboo window'
    ],
    rating: 4.95,
    reviewCount: 16,
    reviewsList: [
      {
        id: 'rev-5',
        author: 'Dilshan R.',
        location: 'Colombo 07, Sri Lanka 🇱🇰',
        rating: 5,
        date: 'August 22, 2026',
        title: 'Smooth gliding and very luxurious',
        content: 'Glides like butter on roads and malls. The folding is smooth and fits easily in the trunk. Top-tier luxury.',
        verified: true,
        fit: 'Standard'
      }
    ],
    seoTitle: 'Celeste Convertible Ergonomic Stroller | Luxury Baby Gear | REXBEBE',
    seoDescription: 'The Celeste modular high-landscape ergonomic baby stroller. Aircraft-grade aluminum frame and shock-absorbing suspension.'
  },
  {
    id: 'prod-5',
    name: 'Petit Prince Cashmere Cardigan & Bonnet Set',
    slug: 'petit-prince-cashmere-cardigan-bonnet-set',
    sku: 'REX-PRINCE-005',
    shortDescription: 'Plush Mongolian cashmere cable-knit cardigan and matching ears bonnet.',
    description: 'Delicate hand-stitched pearl buttons with plush Mongolian cashmere cable-knit cardigan and matching ears bonnet. Heirloom keepsake gift set packaged in a luxury ribbon box.',
    price: 16500,
    comparePrice: 19500,
    discountPercentage: 15,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isSaleBadge: true,
    status: 'published',
    brand: 'REXBEBE Atelier',
    gender: 'Baby',
    ageGroup: '0–3 months',
    category: { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing' },
    subcategory: { id: 'sub-cardigans', name: 'Cardigans & Knitwear', slug: 'cardigans' },
    collection: { id: 'coll-autumn', name: 'Autumn Atelier Collection', slug: 'autumn-atelier' },
    images: [
      { id: 'img-6', url: '/images/products/organic-onesie.jpg', alt: 'Petit Prince Cashmere Cardigan & Bonnet Set', position: 1 }
    ],
    variants: [
      { id: 'var-5a', sku: 'CARD-ROSE-03M', size: '0–3 Months', color: 'Dusty Rose', colorHex: '#E8C5C8', price: 16500, stockQuantity: 15 },
      { id: 'var-5b', sku: 'CARD-BLUE-06M', size: '3–6 Months', color: 'Powder Blue', colorHex: '#B9E3F7', price: 16500, stockQuantity: 12 }
    ],
    colors: [
      { name: 'Dusty Rose', hex: '#E8C5C8' },
      { name: 'Powder Blue', hex: '#B9E3F7' }
    ],
    sizes: ['Newborn', '0–3 Months', '3–6 Months', '6–12 Months'],
    stockQuantity: 27,
    lowStockThreshold: 4,
    stockStatus: 'in_stock',
    fabricMaterial: '100% Pure Mongolian Cashmere & Mulberry Silk Lining',
    careInstructions: 'Hand wash with cold water. Lay flat to dry on towel. Do not hang dry or tumble dry.',
    countryOfOrigin: 'Mongolia & Sri Lanka',
    weight: '140g',
    features: [
      'Ultra-soft 2-ply pure Mongolian cashmere',
      'Hand-carved freshwater shell buttons',
      'Adorable teddy bear ears bonnet included',
      'Heirloom presentation box tied with silk ribbon'
    ],
    rating: 4.9,
    reviewCount: 34,
    reviewsList: [
      {
        id: 'rev-6',
        author: 'Kavindi W.',
        location: 'Kurunegala, Sri Lanka 🇱🇰',
        rating: 5,
        date: 'September 24, 2026',
        title: 'Unbelievably soft and gorgeous bonnet!',
        content: 'The ears on the bonnet are so sweet! The cardigan is thick and warm yet lightweight. We used it for baby photoshoot.',
        verified: true,
        fit: 'True to Size'
      }
    ],
    seoTitle: 'Petit Prince Cashmere Cardigan & Bonnet Set | REXBEBE',
    seoDescription: 'Pure Mongolian cashmere cable-knit cardigan with matching teddy ears bonnet. An heirloom baby luxury gift set by REXBEBE.'
  }
];
