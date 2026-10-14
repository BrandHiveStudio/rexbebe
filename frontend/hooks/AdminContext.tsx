'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';
import {
  HomepageConfig,
  NavigationConfig,
  NavItemConfig,
  VisitorLog,
  VisitorStats,
} from '../types/admin';
import {
  DEFAULT_HOMEPAGE_CONFIG,
  DEFAULT_NAVIGATION_CONFIG,
  INITIAL_CATALOG_PRODUCTS,
  INITIAL_VISITOR_LOGS,
} from '../services/defaultData';
import { navigationService } from '../services/navigationService';
import { productService } from '../services/productService';
import { orderService, OrderRecord } from '../services/orderService';
import { inventoryService, InventoryItemView, StockAdjustmentRecord } from '../services/inventoryService';
import {
  adminService,
  DashboardOverviewData,
  FeedbackRecord,
  AdminUserRecord,
  AuditLogRecord,
} from '../services/adminService';

interface AdminContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Promise<Product>;
  updateProduct: (product: Product) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<Product | null>;
  updateProductStatus: (id: string, status: 'draft' | 'published' | 'unpublished') => Promise<void>;
  toggleBestSeller: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  toggleNewArrival: (id: string) => Promise<void>;
  resetProductsToDefault: () => void;

  // Homepage Customization
  homepageConfig: HomepageConfig;
  updateHomepageConfig: (partial: Partial<HomepageConfig> | ((prev: HomepageConfig) => HomepageConfig)) => Promise<void>;
  resetHomepageConfig: () => Promise<void>;

  // Navigation Customization
  navigationConfig: NavigationConfig;
  updateNavigationConfig: (config: NavigationConfig) => Promise<void>;
  addNavItem: (item: Omit<NavItemConfig, 'id'> & { id?: string }) => void;
  updateNavItem: (item: NavItemConfig) => void;
  deleteNavItem: (id: string) => void;
  resetNavigationConfig: () => void;

  // Visitor Tracking & Analytics
  visitorLogs: VisitorLog[];
  visitorStats: VisitorStats;
  trackCurrentVisitor: (page?: string) => Promise<void>;
  simulateVisitor: (countryCode?: string) => void;
  clearVisitorLogs: () => void;

  // Orders Management
  orders: OrderRecord[];
  updateOrderStatus: (
    orderId: string,
    status: OrderRecord['status'],
    carrier?: string,
    trackingNumber?: string,
    note?: string
  ) => Promise<void>;
  addOrderNote: (orderId: string, note: string) => Promise<void>;
  refundOrder: (orderId: string, reason?: string) => Promise<void>;

  // Inventory Management
  inventoryItems: InventoryItemView[];
  stockAdjustments: StockAdjustmentRecord[];
  updateInventoryStock: (variantId: string, quantity: number, reason?: string) => Promise<void>;
  refreshInventory: () => Promise<void>;

  // Customer Feedback & Reviews
  feedbackItems: FeedbackRecord[];
  updateFeedbackStatus: (id: string, status: FeedbackRecord['status']) => Promise<void>;
  addFeedbackNote: (id: string, note: string) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;

  // Admin Users & Governance
  adminUsers: AdminUserRecord[];
  addAdminUser: (payload: { name: string; email: string; role: string; permissions?: string[] }) => Promise<void>;
  updateAdminUserStatus: (id: string, data: { status?: string; role?: string; permissions?: string[] }) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
  auditLogs: AuditLogRecord[];

  // Store Settings
  storeSettings: any;
  updateStoreSettings: (newSettings: any) => Promise<void>;

  // SEO Settings
  seoSettings: any;
  updateSeoSettings: (seoData: any) => Promise<void>;

  // Dashboard Overview Metrics
  dashboardOverview: DashboardOverviewData | null;
  fetchDashboardOverview: () => Promise<void>;

  isLoaded: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'rexbebe_admin_products',
  HOMEPAGE: 'rexbebe_admin_homepage',
  NAVIGATION: 'rexbebe_admin_navigation',
  VISITORS: 'rexbebe_admin_visitors',
  ORDERS: 'rexbebe_admin_orders',
  INVENTORY: 'rexbebe_admin_inventory',
  FEEDBACK: 'rexbebe_admin_feedback',
  USERS: 'rexbebe_admin_users',
  SETTINGS: 'rexbebe_admin_settings',
};

const COUNTRY_SEEDS: Record<string, { name: string; flag: string; cities: string[]; ipPrefix: string }> = {
  LK: { name: 'Sri Lanka', flag: '🇱🇰', cities: ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Kurunegala'], ipPrefix: '112.134.' },
  US: { name: 'United States', flag: '🇺🇸', cities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Austin'], ipPrefix: '72.229.' },
  GB: { name: 'United Kingdom', flag: '🇬🇧', cities: ['London', 'Manchester', 'Edinburgh', 'Birmingham'], ipPrefix: '86.130.' },
  AE: { name: 'United Arab Emirates', flag: '🇦🇪', cities: ['Dubai', 'Abu Dhabi', 'Sharjah'], ipPrefix: '194.170.' },
  AU: { name: 'Australia', flag: '🇦🇺', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'], ipPrefix: '139.130.' },
  CA: { name: 'Canada', flag: '🇨🇦', cities: ['Toronto', 'Vancouver', 'Montreal'], ipPrefix: '142.250.' },
  DE: { name: 'Germany', flag: '🇩🇪', cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'], ipPrefix: '185.120.' },
  FR: { name: 'France', flag: '🇫🇷', cities: ['Paris', 'Lyon', 'Marseille'], ipPrefix: '193.54.' },
  SG: { name: 'Singapore', flag: '🇸🇬', cities: ['Singapore'], ipPrefix: '118.189.' },
  JP: { name: 'Japan', flag: '🇯🇵', cities: ['Tokyo', 'Osaka', 'Kyoto'], ipPrefix: '133.242.' },
};

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_CATALOG_PRODUCTS);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG);
  const [navigationConfig, setNavigationConfig] = useState<NavigationConfig>(DEFAULT_NAVIGATION_CONFIG);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>(INITIAL_VISITOR_LOGS);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemView[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustmentRecord[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackRecord[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [seoSettings, setSeoSettings] = useState<any>(null);
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverviewData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state from localStorage and synchronize from backend
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedHomepage = localStorage.getItem(STORAGE_KEYS.HOMEPAGE);
      if (savedHomepage) setHomepageConfig(prev => ({ ...prev, ...JSON.parse(savedHomepage) }));

      const savedNav = localStorage.getItem(STORAGE_KEYS.NAVIGATION);
      if (savedNav) {
        try {
          const parsedNav = JSON.parse(savedNav);
          const shopItem = parsedNav.items?.find((i: any) => i.id === 'nav-shop' || i.name === 'SHOP');
          if (shopItem && shopItem.subGroups && shopItem.subGroups.length < 9) {
            setNavigationConfig(DEFAULT_NAVIGATION_CONFIG);
          } else {
            setNavigationConfig(parsedNav);
          }
        } catch {
          setNavigationConfig(DEFAULT_NAVIGATION_CONFIG);
        }
      }

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedVisitors = localStorage.getItem(STORAGE_KEYS.VISITORS);
      if (savedVisitors) setVisitorLogs(JSON.parse(savedVisitors));

      // Asynchronously sync from backend API (Database source of truth)
      productService.getProducts().then(apiProducts => {
        if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
          setProducts(apiProducts);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(apiProducts));
        }
      }).catch(e => console.warn('Backend products sync notice:', e));

      navigationService.getAllNavigation().then(apiNav => {
        if (apiNav && apiNav.items && apiNav.items.length > 0) {
          setNavigationConfig(apiNav);
          localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(apiNav));
        }
      }).catch(e => console.warn('Backend navigation sync notice:', e));

      adminService.getHomepage().then(apiHp => {
        if (apiHp && apiHp.hero) {
          setHomepageConfig(prev => ({ ...prev, ...apiHp }));
          localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(apiHp));
        }
      }).catch(e => console.warn('Backend homepage sync notice:', e));

      orderService.getAllOrdersAdmin().then(apiOrders => {
        if (apiOrders && Array.isArray(apiOrders)) {
          setOrders(apiOrders);
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(apiOrders));
        }
      }).catch(e => console.warn('Backend orders sync notice:', e));

      inventoryService.getInventoryList().then(items => {
        if (items) setInventoryItems(items);
      }).catch(e => console.warn('Backend inventory sync notice:', e));

      inventoryService.getAdjustments().then(adjs => {
        if (adjs) setStockAdjustments(adjs);
      }).catch(e => console.warn('Backend adjustments sync notice:', e));

      adminService.getFeedback().then(fb => {
        if (fb) setFeedbackItems(fb);
      }).catch(e => console.warn('Backend feedback sync notice:', e));

      adminService.getUsers().then(u => {
        if (u) setAdminUsers(u);
      }).catch(e => console.warn('Backend users sync notice:', e));

      adminService.getSettings().then(s => {
        if (s) setStoreSettings(s);
      }).catch(e => console.warn('Backend settings sync notice:', e));

      adminService.getSeo().then(s => {
        if (s) setSeoSettings(s);
      }).catch(e => console.warn('Backend SEO sync notice:', e));

      adminService.getAuditLogs().then(logs => {
        if (logs) setAuditLogs(logs);
      }).catch(e => console.warn('Backend logs sync notice:', e));

      adminService.getOverview().then(ov => {
        if (ov) setDashboardOverview(ov);
      }).catch(e => console.warn('Backend overview sync notice:', e));

      adminService.getVisitors().then(vis => {
        if (vis && Array.isArray(vis) && vis.length > 0) {
          setVisitorLogs(vis);
        }
      }).catch(e => console.warn('Backend visitors sync notice:', e));

    } catch (e) {
      console.warn('Could not read admin state from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Products CRUD
  const saveProducts = useCallback((newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'> & { id?: string }): Promise<Product> => {
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const price = Number(productData.price) || 0;
    const comparePrice =
      productData.comparePrice && Number(productData.comparePrice) > price
        ? Number(productData.comparePrice)
        : undefined;
    const discountPercentage =
      comparePrice && comparePrice > price
        ? Math.round((1 - price / comparePrice) * 100)
        : undefined;

    const payload: any = {
      ...productData,
      slug,
      sku: productData.sku || `REX-${slug.substring(0, 6).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      shortDescription: productData.shortDescription || productData.description?.slice(0, 100) || '',
      description: productData.description || '',
      price,
      comparePrice,
      discountPercentage,
      isFeatured: productData.isFeatured ?? false,
      isNewArrival: productData.isNewArrival ?? true,
      isBestSeller: productData.isBestSeller ?? false,
      isSaleBadge: Boolean(productData.isSaleBadge || (comparePrice && comparePrice > price)),
      status: productData.status || 'published',
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      variants: productData.variants && productData.variants.length > 0 ? productData.variants : [
        {
          id: `var-${Date.now()}`,
          sku: `${slug.substring(0, 4).toUpperCase()}-STD`,
          price,
          stockQuantity: Number(productData.stockQuantity) || 20,
          size: 'Standard',
          color: 'Natural',
        }
      ],
      images: productData.images && productData.images.length > 0 ? productData.images : [
        { id: `img-${Date.now()}`, url: '/images/products/organic-onesie.jpg', alt: productData.name, position: 1 }
      ],
    };

    // Save to actual database / backend first
    const saved = await productService.createProduct(payload);
    const nextList = [saved, ...products.filter(p => p.id !== saved.id)];
    saveProducts(nextList);
    return saved;
  }, [products, saveProducts]);

  const updateProduct = useCallback(async (updatedProduct: Product): Promise<Product> => {
    // Save to actual database / backend first
    const saved = await productService.updateProduct(updatedProduct.id, updatedProduct);
    const updated = products.map(p => (p.id === saved.id ? saved : p));
    saveProducts(updated);
    return saved;
  }, [products, saveProducts]);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    // Execute permanent deletion in database / backend first
    await productService.deleteProduct(id);
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
  }, [products, saveProducts]);

  const duplicateProduct = useCallback(async (id: string): Promise<Product | null> => {
    const original = products.find(p => p.id === id);
    if (!original) return null;

    const clonedId = `prod-${Date.now()}`;
    const clonedSlug = `${original.slug}-copy-${Math.floor(Math.random() * 900 + 100)}`;
    const clonedName = `${original.name} (Copy)`;
    const clonedSku = `${original.sku || 'REX'}-CPY`;

    const cloned: Product = {
      ...original,
      id: clonedId,
      name: clonedName,
      slug: clonedSlug,
      sku: clonedSku,
      status: 'draft',
    };

    const saved = await productService.createProduct(cloned);
    const next = [saved, ...products];
    saveProducts(next);
    return saved;
  }, [products, saveProducts]);

  const updateProductStatus = useCallback(async (id: string, status: 'draft' | 'published' | 'unpublished'): Promise<void> => {
    const updatedProduct = await productService.updateStatus(id, status);
    const updated = products.map(p => (p.id === id ? { ...p, status: updatedProduct.status } : p));
    saveProducts(updated);
  }, [products, saveProducts]);

  const toggleBestSeller = useCallback(async (id: string): Promise<void> => {
    const updatedProduct = await productService.toggleBestSeller(id);
    const updated = products.map(p => (p.id === id ? { ...p, isBestSeller: updatedProduct.isBestSeller } : p));
    saveProducts(updated);
  }, [products, saveProducts]);

  const toggleFeatured = useCallback(async (id: string): Promise<void> => {
    const updatedProduct = await productService.toggleFeatured(id);
    const updated = products.map(p => (p.id === id ? { ...p, isFeatured: updatedProduct.isFeatured } : p));
    saveProducts(updated);
  }, [products, saveProducts]);

  const toggleNewArrival = useCallback(async (id: string): Promise<void> => {
    const updatedProduct = await productService.toggleNewArrival(id);
    const updated = products.map(p => (p.id === id ? { ...p, isNewArrival: updatedProduct.isNewArrival } : p));
    saveProducts(updated);
  }, [products, saveProducts]);

  const resetProductsToDefault = useCallback(() => {
    saveProducts(INITIAL_CATALOG_PRODUCTS);
  }, [saveProducts]);

  // Homepage Config
  const updateHomepageConfig = useCallback(async (
    partial: Partial<HomepageConfig> | ((prev: HomepageConfig) => HomepageConfig)
  ): Promise<void> => {
    const next = typeof partial === 'function' ? partial(homepageConfig) : { ...homepageConfig, ...partial };
    setHomepageConfig(next);
    try {
      localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    await adminService.updateHomepage(next);
  }, [homepageConfig]);

  const resetHomepageConfig = useCallback(async (): Promise<void> => {
    const reset = await adminService.resetHomepage();
    setHomepageConfig(reset || DEFAULT_HOMEPAGE_CONFIG);
    try {
      localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(DEFAULT_HOMEPAGE_CONFIG));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Navigation Config
  const updateNavigationConfig = useCallback(async (config: NavigationConfig): Promise<void> => {
    const updated = await navigationService.updateNavigation(config);
    setNavigationConfig(updated || config);
    try {
      localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(updated || config));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addNavItem = useCallback((itemData: Omit<NavItemConfig, 'id'> & { id?: string }) => {
    const newId = itemData.id || `nav-${Date.now()}`;
    const newItem: NavItemConfig = {
      ...itemData,
      id: newId,
      order: itemData.order || navigationConfig.items.length + 1,
      isActive: itemData.isActive ?? true,
    };
    const nextConfig = {
      ...navigationConfig,
      items: [...navigationConfig.items, newItem],
    };
    updateNavigationConfig(nextConfig);
  }, [navigationConfig, updateNavigationConfig]);

  const updateNavItem = useCallback((item: NavItemConfig) => {
    const nextConfig = {
      ...navigationConfig,
      items: navigationConfig.items.map(i => (i.id === item.id ? item : i)),
    };
    updateNavigationConfig(nextConfig);
  }, [navigationConfig, updateNavigationConfig]);

  const deleteNavItem = useCallback((id: string) => {
    const nextConfig = {
      ...navigationConfig,
      items: navigationConfig.items.filter(i => i.id !== id),
    };
    updateNavigationConfig(nextConfig);
  }, [navigationConfig, updateNavigationConfig]);

  const resetNavigationConfig = useCallback(() => {
    updateNavigationConfig(DEFAULT_NAVIGATION_CONFIG);
  }, [updateNavigationConfig]);

  // Visitor Tracking & Analytics
  const trackCurrentVisitor = useCallback(async (page: string = '/') => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const newLog: VisitorLog = {
          id: `vis-${Date.now()}`,
          ip: data.ip || '112.134.198.42',
          countryCode: data.country_code || 'LK',
          countryName: data.country_name || 'Sri Lanka',
          city: data.city || 'Colombo',
          region: data.region || 'Western',
          flag: '🇱🇰',
          device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : 'Desktop',
          browser: 'Chrome',
          page,
          referrer: 'Direct Visit',
          timestamp: new Date().toISOString(),
          visitsCount: 1,
        };
        setVisitorLogs(prev => [newLog, ...prev.slice(0, 499)]);
      }
    } catch {
      // Fallback local tracking
    }
  }, []);

  const simulateVisitor = useCallback((countryCode?: string) => {
    const code = countryCode || 'US';
    const seed = COUNTRY_SEEDS[code] || COUNTRY_SEEDS.US;
    const randomCity = seed.cities[Math.floor(Math.random() * seed.cities.length)];
    const randomIp = `${seed.ipPrefix}${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 10)}`;

    const newLog: VisitorLog = {
      id: `vis-${Date.now()}`,
      ip: randomIp,
      countryCode: code,
      countryName: seed.name,
      city: randomCity,
      region: 'Central',
      flag: seed.flag,
      device: Math.random() > 0.4 ? 'Mobile' : 'Desktop',
      browser: Math.random() > 0.5 ? 'Safari' : 'Chrome',
      page: '/baby',
      referrer: 'Direct Visit',
      timestamp: new Date().toISOString(),
      visitsCount: 1,
    };

    adminService.trackVisitor(newLog).catch(e => console.warn(e));

    setVisitorLogs(prev => {
      const next = [newLog, ...prev.slice(0, 499)];
      try {
        localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  const clearVisitorLogs = useCallback(() => {
    setVisitorLogs([]);
    try {
      localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    adminService.clearVisitors().catch(e => console.warn(e));
  }, []);

  const visitorStats: VisitorStats = React.useMemo(() => {
    const total = visitorLogs.reduce((acc, curr) => acc + curr.visitsCount, 0);
    const unique = new Set(visitorLogs.map(v => v.ip)).size;

    return {
      totalVisits: total || 1,
      uniqueVisitors: unique || 1,
      topCountry: visitorLogs[0]?.countryName || 'Sri Lanka',
      topCountryVisits: total || 1,
      liveVisitors: Math.min(unique || 1, 6),
    };
  }, [visitorLogs]);

  // Orders Management
  const updateOrderStatus = useCallback(async (
    orderId: string,
    status: OrderRecord['status'],
    carrier?: string,
    trackingNumber?: string,
    note?: string
  ) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status, carrier: carrier || o.carrier, trackingNumber: trackingNumber || o.trackingNumber } : o))
    );
    try {
      const updated = await orderService.updateOrderStatus(orderId, status, carrier, trackingNumber, note);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Error updating order status:', e);
    }
  }, [orders]);

  const addOrderNote = useCallback(async (orderId: string, note: string) => {
    try {
      const updated = await orderService.addOrderNote(orderId, note);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
    } catch (e) {
      console.error('Error adding order note:', e);
    }
  }, []);

  const refundOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      const updated = await orderService.refundOrder(orderId, reason);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
    } catch (e) {
      console.error('Error processing refund:', e);
    }
  }, []);

  // Inventory Management
  const refreshInventory = useCallback(async () => {
    try {
      const items = await inventoryService.getInventoryList();
      setInventoryItems(items);
      const adjs = await inventoryService.getAdjustments();
      setStockAdjustments(adjs);
    } catch (e) {
      console.error('Error refreshing inventory:', e);
    }
  }, []);

  const updateInventoryStock = useCallback(async (variantId: string, quantity: number, reason?: string) => {
    try {
      await inventoryService.updateStock(variantId, quantity, reason);
      await refreshInventory();
      // Also update products state
      const prods = await productService.getProducts();
      setProducts(prods);
    } catch (e) {
      console.error('Error updating inventory stock:', e);
    }
  }, [refreshInventory]);

  // Feedback Management
  const updateFeedbackStatus = useCallback(async (id: string, status: FeedbackRecord['status']) => {
    try {
      const updated = await adminService.updateFeedbackStatus(id, status);
      setFeedbackItems(prev => prev.map(f => (f.id === id ? updated : f)));
    } catch (e) {
      console.error('Error updating feedback status:', e);
    }
  }, []);

  const addFeedbackNote = useCallback(async (id: string, note: string) => {
    try {
      const updated = await adminService.addFeedbackNote(id, note);
      setFeedbackItems(prev => prev.map(f => (f.id === id ? updated : f)));
    } catch (e) {
      console.error('Error adding feedback note:', e);
    }
  }, []);

  const deleteFeedback = useCallback(async (id: string) => {
    try {
      await adminService.deleteFeedback(id);
      setFeedbackItems(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      console.error('Error deleting feedback:', e);
    }
  }, []);

  // Admin Users & Governance
  const addAdminUser = useCallback(async (payload: { name: string; email: string; role: string; permissions?: string[] }) => {
    try {
      const created = await adminService.createUser(payload);
      setAdminUsers(prev => [...prev, created]);
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.error('Error creating admin user:', e);
      throw e;
    }
  }, []);

  const updateAdminUserStatus = useCallback(async (id: string, data: { status?: string; role?: string; permissions?: string[] }) => {
    try {
      const updated = await adminService.updateUserStatus(id, data);
      setAdminUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.error('Error updating admin user:', e);
    }
  }, []);

  const deleteAdminUser = useCallback(async (id: string) => {
    await adminService.deleteUser(id);
    setAdminUsers(prev => prev.filter(u => u.id !== id));
    const logs = await adminService.getAuditLogs();
    setAuditLogs(logs);
  }, []);

  // Store Settings
  const updateStoreSettings = useCallback(async (newSettings: any) => {
    try {
      const updated = await adminService.updateSettings(newSettings);
      setStoreSettings(updated);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating settings:', e);
    }
  }, []);

  // SEO Settings
  const updateSeoSettings = useCallback(async (newSeo: any) => {
    try {
      const updated = await adminService.updateSeo(newSeo);
      setSeoSettings(updated);
    } catch (e) {
      console.error('Error updating SEO settings:', e);
      throw e;
    }
  }, []);

  // Dashboard Overview
  const fetchDashboardOverview = useCallback(async () => {
    try {
      const ov = await adminService.getOverview();
      setDashboardOverview(ov);
    } catch (e) {
      console.error('Error fetching dashboard overview:', e);
    }
  }, []);

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    updateProductStatus,
    toggleBestSeller,
    toggleFeatured,
    toggleNewArrival,
    resetProductsToDefault,

    homepageConfig,
    updateHomepageConfig,
    resetHomepageConfig,

    navigationConfig,
    updateNavigationConfig,
    addNavItem,
    updateNavItem,
    deleteNavItem,
    resetNavigationConfig,

    visitorLogs,
    visitorStats,
    trackCurrentVisitor,
    simulateVisitor,
    clearVisitorLogs,

    orders,
    updateOrderStatus,
    addOrderNote,
    refundOrder,

    inventoryItems,
    stockAdjustments,
    updateInventoryStock,
    refreshInventory,

    feedbackItems,
    updateFeedbackStatus,
    addFeedbackNote,
    deleteFeedback,

    adminUsers,
    addAdminUser,
    updateAdminUserStatus,
    deleteAdminUser,
    auditLogs,

    storeSettings,
    updateStoreSettings,

    seoSettings,
    updateSeoSettings,

    dashboardOverview,
    fetchDashboardOverview,

    isLoaded,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
