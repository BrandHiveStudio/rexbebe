import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';

const MOCK_CATEGORIES = [
  { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing', description: 'Organic cotton rompers, cashmere knits & sleepers', image: '/images/products/organic-onesie.jpg' },
  { id: 'cat-toys', name: 'Nursery & Toys', slug: 'nursery-toys', description: 'Handcrafted wooden activity gyms, plush rattles & crib mobiles', image: '/images/products/wooden-gym.jpg' },
  { id: 'cat-essentials', name: 'Bedding & Swaddles', slug: 'bedding-swaddles', description: 'French flax linen swaddles, organic crib sheets & cashmere blankets', image: '/images/products/hero-nursery.jpg' },
  { id: 'cat-gear', name: 'Baby Gear & Travel', slug: 'gear-travel', description: 'Ergonomic luxury strollers, leather diaper bags & car seats', image: '/images/products/hero-nursery.jpg' },
];

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return sendSuccess(res, MOCK_CATEGORIES, 'Categories retrieved');
  } catch (err) {
    next(err);
  }
};
