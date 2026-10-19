import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { sendSuccess, sendError } from '../utils/response';
import { navigationStorage } from '../services/navigationStorage';

const router = Router();

const settingsFilePath = path.join(__dirname, '../../data/settings.json');
const usersFilePath = path.join(__dirname, '../../data/admin_users.json');
const feedbackFilePath = path.join(__dirname, '../../data/feedback.json');
const auditLogsFilePath = path.join(__dirname, '../../data/audit_logs.json');
const ordersFilePath = path.join(__dirname, '../../data/orders.json');
const productsFilePath = path.join(__dirname, '../../data/products.json');
const homepageFilePath = path.join(__dirname, '../../data/homepage.json');
const visitorsFilePath = path.join(__dirname, '../../data/visitors.json');
const seoFilePath = path.join(__dirname, '../../data/seo.json');

// Helper to safely read JSON file
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`[adminRoutes] Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to safely write JSON file
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[adminRoutes] Error writing ${filePath}:`, err);
  }
}

// Persistent visitor logs helpers
function getVisitorLogs(): any[] {
  return readJsonFile<any[]>(visitorsFilePath, []);
}

function saveVisitorLogs(logs: any[]): void {
  writeJsonFile(visitorsFilePath, logs);
}

// Helper to record audit log
function recordAudit(userEmail: string, userName: string, action: string, details: string, ip: string = '127.0.0.1') {
  const logs = readJsonFile<any[]>(auditLogsFilePath, []);
  logs.unshift({
    id: `log-${Date.now()}`,
    userEmail,
    userName,
    action,
    details,
    ip,
    timestamp: new Date().toISOString(),
  });
  if (logs.length > 500) logs.pop();
  writeJsonFile(auditLogsFilePath, logs);
}

// -------------------------------------------------------------
// 1. STORE OVERVIEW / DASHBOARD ANALYTICS (REAL CALCULATIONS)
// -------------------------------------------------------------
router.get('/overview', (req: Request, res: Response) => {
  const orders = readJsonFile<any[]>(ordersFilePath, []);
  const products = readJsonFile<any[]>(productsFilePath, []);

  // Performance calculations
  const totalOrders = orders.length;
  const newOrders = orders.filter(o => o.status === 'NEW').length;
  const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
  const packedOrders = orders.filter(o => o.status === 'PACKED').length;
  const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

  // Strict business rule: Only count PAID orders as revenue (do NOT count pending, cancelled or refunded)
  const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
  const totalSales = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const salesToday = paidOrders
    .filter(o => o.createdAt && o.createdAt.slice(0, 10) === todayStr)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const salesThisMonth = paidOrders
    .filter(o => o.createdAt && o.createdAt.slice(0, 7) === currentMonthStr)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Product & Inventory overview
  const totalActiveProducts = products.filter(p => p.status !== 'unpublished').length;
  const draftProducts = products.filter(p => p.status === 'draft').length;
  const publishedProducts = products.filter(p => p.status === 'published' || !p.status).length;
  const newArrivalsCount = products.filter(p => p.isNewArrival).length;
  const saleProductsCount = products.filter(p => p.comparePrice && p.comparePrice > p.price).length;

  let lowStockCount = 0;
  let outOfStockCount = 0;
  const lowStockAlerts: any[] = [];

  products.forEach(p => {
    const threshold = p.lowStockThreshold || 5;
    const totalQty = p.variants?.reduce((s: number, v: any) => s + (v.stockQuantity || 0), 0) ?? p.stockQuantity ?? 0;
    if (totalQty <= 0) outOfStockCount++;
    else if (totalQty <= threshold) lowStockCount++;

    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((v: any) => {
        const vQty = v.stockQuantity ?? 0;
        if (vQty <= threshold) {
          lowStockAlerts.push({
            productId: p.id,
            productName: p.name,
            productSlug: p.slug,
            variantId: v.id,
            sku: v.sku || p.sku || 'N/A',
            color: v.color || (v.partColors ? Object.values(v.partColors).join(', ') : 'Standard'),
            size: v.size || 'Standard',
            remainingQuantity: vQty,
            threshold,
            status: vQty <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            image: v.imageUrl || p.images?.[0]?.url || '/images/products/organic-onesie.jpg',
          });
        }
      });
    } else {
      const pQty = p.stockQuantity ?? 0;
      if (pQty <= threshold) {
        lowStockAlerts.push({
          productId: p.id,
          productName: p.name,
          productSlug: p.slug,
          variantId: `var-${p.id}`,
          sku: p.sku || 'N/A',
          color: 'Standard',
          size: 'Standard',
          remainingQuantity: pQty,
          threshold,
          status: pQty <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          image: p.images?.[0]?.url || '/images/products/organic-onesie.jpg',
        });
      }
    }
  });

  return sendSuccess(res, {
    performance: {
      totalOrders,
      newOrders,
      processingOrders,
      packedOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
      totalSales,
      salesToday,
      salesThisMonth,
      currency: 'LKR',
    },
    inventory: {
      totalActiveProducts,
      draftProducts,
      publishedProducts,
      lowStockCount,
      outOfStockCount,
      lowStockAlerts,
      newArrivalsCount,
      saleProductsCount,
    },
    visitors: {
      totalVisits: getVisitorLogs().length,
      uniqueVisitors: new Set(getVisitorLogs().map(v => v.ip)).size,
      recentLogs: getVisitorLogs().slice(0, 5),
    },
    lowStockAlerts,
    timestamp: new Date().toISOString(),
  }, 'Dashboard overview generated from live records');
});

// -------------------------------------------------------------
// 2. HOMEPAGE STUDIO CONFIGURATION (DATABASE / FILE PERSISTENT)
// -------------------------------------------------------------
router.get('/homepage', (req: Request, res: Response) => {
  const config = readJsonFile<any>(homepageFilePath, {});
  return sendSuccess(res, config, 'Homepage configuration retrieved');
});

router.put('/homepage', (req: Request, res: Response) => {
  const current = readJsonFile<any>(homepageFilePath, {});
  const updated = { ...current, ...req.body };
  writeJsonFile(homepageFilePath, updated);
  recordAudit('admin@rexbebe.com', 'Admin Executive', 'HOMEPAGE_UPDATE', 'Updated homepage studio sections');
  return sendSuccess(res, updated, 'Changes saved successfully.');
});

router.post('/homepage/reset', (req: Request, res: Response) => {
  // Reset to default brand configuration
  const defaultHomepage = {
    hero: {
      headlineLine1: 'Little Moments.',
      headlineLine2: 'Big Adventures.',
      speechBubbleText: 'Welcome to REXBEBE! 🦕✨',
      ctaPrimaryText: 'Shop New Season',
      ctaPrimaryHref: '/new-in',
      ctaSecondaryText: 'Explore Nursery',
      ctaSecondaryHref: '/shop?category=nursery-toys',
      badgeText: '2026 Atelier Collection',
    },
    bestSellers: {
      title: 'Featured Little Favorites',
      badge: 'Parent Favorites 🧸',
      maxItems: 4,
    },
  };
  writeJsonFile(homepageFilePath, defaultHomepage);
  recordAudit('admin@rexbebe.com', 'Admin Executive', 'HOMEPAGE_RESET', 'Reset homepage studio to brand defaults');
  return sendSuccess(res, defaultHomepage, 'Homepage configuration reset to defaults');
});

// -------------------------------------------------------------
// 3. NAVIGATION MANAGEMENT
// -------------------------------------------------------------
router.get('/navigation', (req: Request, res: Response) => {
  return sendSuccess(res, navigationStorage.getAll(), 'Navigation configuration retrieved');
});

router.put('/navigation', (req: Request, res: Response) => {
  try {
    const updated = navigationStorage.updateAll(req.body);
    recordAudit('admin@rexbebe.com', 'Admin Executive', 'NAVIGATION_UPDATE', 'Updated header navigation structure');
    return sendSuccess(res, updated, 'Changes saved successfully.');
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
});

router.post('/navigation/reset', (req: Request, res: Response) => {
  try {
    const reset = navigationStorage.reset();
    recordAudit('admin@rexbebe.com', 'Admin Executive', 'NAVIGATION_RESET', 'Reset navigation to factory defaults');
    return sendSuccess(res, reset, 'Navigation configuration reset to defaults');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
});

// -------------------------------------------------------------
// 4. GLOBAL VISITOR ANALYTICS & PRIVACY-COMPLIANT TRACKING
// -------------------------------------------------------------
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

  const logs = getVisitorLogs();
  logs.unshift(newLog);
  if (logs.length > 500) logs.pop();
  saveVisitorLogs(logs);

  return sendSuccess(res, newLog, 'Visitor tracked successfully');
});

router.get('/analytics/visitors', (req: Request, res: Response) => {
  const { period } = req.query;
  const logs = getVisitorLogs();
  let filtered = logs;

  const now = Date.now();
  if (period === 'today') {
    const todayStr = new Date().toISOString().slice(0, 10);
    filtered = filtered.filter(v => v.timestamp.slice(0, 10) === todayStr);
  } else if (period === '7d') {
    filtered = filtered.filter(v => now - new Date(v.timestamp).getTime() <= 7 * 86400000);
  } else if (period === '30d') {
    filtered = filtered.filter(v => now - new Date(v.timestamp).getTime() <= 30 * 86400000);
  } else if (period === '90d') {
    filtered = filtered.filter(v => now - new Date(v.timestamp).getTime() <= 90 * 86400000);
  }

  return sendSuccess(res, filtered, 'Visitor log records retrieved');
});

router.delete('/analytics/visitors', (req: Request, res: Response) => {
  saveVisitorLogs([]);
  recordAudit('admin@rexbebe.com', 'Admin Executive', 'ANALYTICS_CLEARED', 'Cleared visitor analytics log');
  return sendSuccess(res, { cleared: true }, 'The item has been permanently deleted.');
});

// -------------------------------------------------------------
// 5. CUSTOMER FEEDBACK & REVIEWS
// -------------------------------------------------------------
router.get('/feedback', (req: Request, res: Response) => {
  const feedback = readJsonFile<any[]>(feedbackFilePath, []);
  const { type, status, search } = req.query;

  let filtered = feedback;
  if (type && type !== 'ALL') {
    filtered = filtered.filter(f => f.type === type);
  }
  if (status && status !== 'ALL') {
    filtered = filtered.filter(f => f.status === status);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(f =>
      f.authorName.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      (f.subject && f.subject.toLowerCase().includes(q)) ||
      (f.message && f.message.toLowerCase().includes(q)) ||
      (f.productName && f.productName.toLowerCase().includes(q))
    );
  }

  return sendSuccess(res, filtered, 'Customer feedback records retrieved');
});

router.patch('/feedback/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const feedback = readJsonFile<any[]>(feedbackFilePath, []);
  const item = feedback.find(f => f.id === id);

  if (!item) {
    return sendError(res, `Feedback item ${id} not found`, 404);
  }

  item.status = status;
  item.updatedAt = new Date().toISOString();
  writeJsonFile(feedbackFilePath, feedback);
  recordAudit('admin@rexbebe.com', 'Admin Executive', 'FEEDBACK_STATUS_CHANGE', `Updated feedback ${id} status to ${status}`);

  return sendSuccess(res, item, `Feedback status updated to ${status}`);
});

router.post('/feedback/:id/notes', (req: Request, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;
  const feedback = readJsonFile<any[]>(feedbackFilePath, []);
  const item = feedback.find(f => f.id === id);

  if (!item) {
    return sendError(res, `Feedback item ${id} not found`, 404);
  }

  item.internalNotes = item.internalNotes ? `${item.internalNotes}\n${note}` : note;
  item.updatedAt = new Date().toISOString();
  writeJsonFile(feedbackFilePath, feedback);

  return sendSuccess(res, item, 'Internal note added to feedback');
});

router.delete('/feedback/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let feedback = readJsonFile<any[]>(feedbackFilePath, []);
  const beforeLen = feedback.length;
  feedback = feedback.filter(f => f.id !== id);

  if (feedback.length === beforeLen) {
    return sendError(res, `Feedback item ${id} not found`, 404);
  }

  writeJsonFile(feedbackFilePath, feedback);
  recordAudit('admin@rexbebe.com', 'Admin Executive', 'FEEDBACK_DELETED', `Deleted feedback item ${id}`);
  return sendSuccess(res, { deleted: true, id }, 'Feedback item removed safely');
});

// -------------------------------------------------------------
// 6. ADMIN USERS & PERMISSION MANAGEMENT
// -------------------------------------------------------------
router.get('/users', (req: Request, res: Response) => {
  const users = readJsonFile<any[]>(usersFilePath, []);
  return sendSuccess(res, users, 'Admin users retrieved');
});

router.post('/users', (req: Request, res: Response) => {
  const { name, email, role, permissions } = req.body;
  if (!name || !email || !role) {
    return sendError(res, 'Name, email, and role are required', 400);
  }

  const users = readJsonFile<any[]>(usersFilePath, []);
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return sendError(res, `An administrator with email ${email} already exists`, 409);
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    role,
    status: 'ACTIVE',
    permissions: permissions || ['manage_orders', 'manage_inventory'],
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };

  users.push(newUser);
  writeJsonFile(usersFilePath, users);
  recordAudit('admin@rexbebe.com', 'Super Admin', 'USER_CREATED', `Created administrator account for ${name} (${email}) with role ${role}`);

  return sendSuccess(res, newUser, 'Administrator created successfully', 201);
});

router.patch('/users/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, role, permissions } = req.body;
  const users = readJsonFile<any[]>(usersFilePath, []);
  const user = users.find(u => u.id === id);

  if (!user) {
    return sendError(res, `Admin user ${id} not found`, 404);
  }

  if (status) user.status = status;
  if (role) user.role = role;
  if (permissions) user.permissions = permissions;
  user.updatedAt = new Date().toISOString();

  writeJsonFile(usersFilePath, users);
  recordAudit('admin@rexbebe.com', 'Super Admin', 'USER_STATUS_CHANGE', `Updated admin ${user.email} status to ${status || user.status}`);

  return sendSuccess(res, user, 'Admin user updated successfully');
});

router.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const users = readJsonFile<any[]>(usersFilePath, []);
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return sendError(res, `Admin user '${id}' not found`, 404);
  }

  const user = users[userIndex];
  if (user.email === 'admin@rexbebe.com') {
    return sendError(res, 'The primary owner / system administrator account cannot be deleted.', 403);
  }

  const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN');
  if (user.role === 'SUPER_ADMIN' && superAdmins.length <= 1) {
    return sendError(res, 'Cannot delete the last Super Administrator. The system requires at least one Super Administrator.', 403);
  }

  users.splice(userIndex, 1);
  writeJsonFile(usersFilePath, users);
  recordAudit('admin@rexbebe.com', 'Super Admin', 'USER_DELETED', `Permanently deleted administrator account "${user.name}" (${user.email})`);

  return sendSuccess(res, { deleted: true, id }, 'The item has been permanently deleted.');
});

// Secure first-admin setup / bootstrap flow
router.post('/setup-first-admin', (req: Request, res: Response) => {
  const users = readJsonFile<any[]>(usersFilePath, []);
  if (users.length > 0) {
    return sendError(res, 'First administrator is already configured. Setup flow is locked for security.', 403);
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return sendError(res, 'Name, email and password are required', 400);
  }

  const firstAdmin = {
    id: 'usr-super-1',
    name,
    email,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    permissions: ['all'],
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  writeJsonFile(usersFilePath, [firstAdmin]);
  recordAudit(email, name, 'INITIAL_ADMIN_SETUP', 'Initialized first super administrator account');

  return sendSuccess(res, firstAdmin, 'Super administrator initialized successfully', 201);
});

// -------------------------------------------------------------
// 7. STORE SETTINGS & LOGISTICS
// -------------------------------------------------------------
router.get('/settings', (req: Request, res: Response) => {
  const settings = readJsonFile<any>(settingsFilePath, {});
  return sendSuccess(res, settings, 'Store settings retrieved');
});

router.put('/settings', (req: Request, res: Response) => {
  const current = readJsonFile<any>(settingsFilePath, {});
  const updated = { ...current, ...req.body };
  writeJsonFile(settingsFilePath, updated);
  recordAudit('admin@rexbebe.com', 'Super Admin', 'SETTINGS_UPDATE', 'Updated boutique store configuration');
  return sendSuccess(res, updated, 'Changes saved successfully.');
});

// -------------------------------------------------------------
// 8. GLOBAL SEO SETTINGS
// -------------------------------------------------------------
router.get('/seo', (req: Request, res: Response) => {
  const seo = readJsonFile<any>(seoFilePath, {});
  return sendSuccess(res, seo, 'SEO settings retrieved');
});

router.put('/seo', (req: Request, res: Response) => {
  const current = readJsonFile<any>(seoFilePath, {});
  const updated = { ...current, ...req.body };
  writeJsonFile(seoFilePath, updated);
  recordAudit('admin@rexbebe.com', 'Admin Executive', 'SEO_UPDATE', 'Updated global SEO settings');
  return sendSuccess(res, updated, 'Changes saved successfully.');
});

// -------------------------------------------------------------
// 9. SECURITY & ACTIVITY AUDIT LOGS
// -------------------------------------------------------------
router.get('/audit-logs', (req: Request, res: Response) => {
  const logs = readJsonFile<any[]>(auditLogsFilePath, []);
  return sendSuccess(res, logs, 'Audit trail logs retrieved');
});

export default router;
