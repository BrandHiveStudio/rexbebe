import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/response';

const router = Router();

// In-memory persistent state in backend service
let backendHomepageConfig: any = {
  hero: {
    headlineLine1: 'Little Moments.',
    headlineLine2: 'Big Adventures.',
    speechBubbleText: 'Welcome to REXBEBE! 🦕✨',
    ctaPrimaryText: 'Shop New Season',
    ctaPrimaryHref: '/new-in',
    ctaSecondaryText: 'Explore Nursery',
    ctaSecondaryHref: '/shop?category=nursery-toys',
  },
  bestSellers: {
    title: 'Featured Little Favorites',
    badge: 'Parent Favorites 🧸',
    maxItems: 4,
  },
};

let backendNavigationConfig: any = {
  items: [
    { id: 'nav-home', name: 'HOME', href: '/', isActive: true, order: 1 },
    { id: 'nav-shop', name: 'SHOP', href: '/shop', isActive: true, order: 2 },
    { id: 'nav-new-in', name: 'NEW IN', href: '/new-in', badge: 'NEW', isActive: true, order: 3 },
    { id: 'nav-girls', name: 'GIRLS', href: '/girls', isActive: true, order: 4 },
    { id: 'nav-boys', name: 'BOYS', href: '/boys', isActive: true, order: 5 },
    { id: 'nav-newborn', name: 'NEWBORN', href: '/baby', isActive: true, order: 6 },
    { id: 'nav-collections', name: 'COLLECTIONS', href: '/collections', isActive: true, order: 7 },
    { id: 'nav-sale', name: 'SALE', href: '/sale', badge: 'SALE', isActive: true, order: 8 },
  ],
};

let backendVisitorLogs: any[] = [
  {
    id: 'vis-1',
    ip: '112.134.198.42',
    countryCode: 'LK',
    countryName: 'Sri Lanka',
    city: 'Colombo',
    flag: '🇱🇰',
    device: 'Mobile',
    browser: 'Safari',
    page: '/',
    timestamp: new Date().toISOString(),
    visitsCount: 1,
  },
];

// 1. Homepage Configuration
router.get('/homepage', (req: Request, res: Response) => {
  return sendSuccess(res, backendHomepageConfig, 'Homepage configuration retrieved');
});

router.put('/homepage', (req: Request, res: Response) => {
  backendHomepageConfig = { ...backendHomepageConfig, ...req.body };
  return sendSuccess(res, backendHomepageConfig, 'Homepage configuration updated');
});

// 2. Navigation Configuration
router.get('/navigation', (req: Request, res: Response) => {
  return sendSuccess(res, backendNavigationConfig, 'Navigation configuration retrieved');
});

router.put('/navigation', (req: Request, res: Response) => {
  backendNavigationConfig = req.body;
  return sendSuccess(res, backendNavigationConfig, 'Navigation configuration updated');
});

// 3. Visitor Tracking & Geo IP Intelligence
router.post('/analytics/track', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '112.134.198.42';
  const cleanIp = clientIp.split(',')[0].trim().replace(/^.*:/, '');

  const newLog = {
    id: `vis-${Date.now()}`,
    ip: cleanIp || req.body.ip || '112.134.198.42',
    countryCode: req.body.countryCode || 'LK',
    countryName: req.body.countryName || 'Sri Lanka',
    city: req.body.city || 'Colombo',
    flag: req.body.flag || '🇱🇰',
    device: req.body.device || 'Desktop',
    browser: req.body.browser || 'Chrome',
    page: req.body.page || '/',
    referrer: req.body.referrer || 'Direct Visit',
    timestamp: new Date().toISOString(),
    visitsCount: 1,
  };

  backendVisitorLogs.unshift(newLog);
  if (backendVisitorLogs.length > 200) backendVisitorLogs.pop();

  return sendSuccess(res, newLog, 'Visitor tracked successfully');
});

router.get('/analytics/visitors', (req: Request, res: Response) => {
  return sendSuccess(res, backendVisitorLogs, 'Visitor log records retrieved');
});

router.delete('/analytics/visitors', (req: Request, res: Response) => {
  backendVisitorLogs = [];
  return sendSuccess(res, { cleared: true }, 'Visitor logs cleared');
});

export default router;
