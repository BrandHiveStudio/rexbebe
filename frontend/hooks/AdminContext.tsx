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

interface AdminContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleBestSeller: (id: string) => void;
  toggleFeatured: (id: string) => void;
  toggleNewArrival: (id: string) => void;
  resetProductsToDefault: () => void;

  // Homepage Customization
  homepageConfig: HomepageConfig;
  updateHomepageConfig: (partial: Partial<HomepageConfig> | ((prev: HomepageConfig) => HomepageConfig)) => void;
  resetHomepageConfig: () => void;

  // Navigation Customization
  navigationConfig: NavigationConfig;
  updateNavigationConfig: (config: NavigationConfig) => void;
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

  isLoaded: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'rexbebe_admin_products',
  HOMEPAGE: 'rexbebe_admin_homepage',
  NAVIGATION: 'rexbebe_admin_navigation',
  VISITORS: 'rexbebe_admin_visitors',
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }

      const savedHomepage = localStorage.getItem(STORAGE_KEYS.HOMEPAGE);
      if (savedHomepage) {
        setHomepageConfig(prev => ({ ...prev, ...JSON.parse(savedHomepage) }));
      }

      const savedNav = localStorage.getItem(STORAGE_KEYS.NAVIGATION);
      if (savedNav) {
        try {
          const parsedNav = JSON.parse(savedNav);
          const shopItem = parsedNav.items?.find((i: any) => i.id === 'nav-shop' || i.name === 'SHOP');
          // Ensure outdated localStorage cache upgrades to full tree
          if (shopItem && shopItem.subGroups && shopItem.subGroups.length < 9) {
            setNavigationConfig(DEFAULT_NAVIGATION_CONFIG);
            localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(DEFAULT_NAVIGATION_CONFIG));
          } else {
            setNavigationConfig(parsedNav);
          }
        } catch {
          setNavigationConfig(DEFAULT_NAVIGATION_CONFIG);
        }
      }

      // Also sync asynchronously with backend API
      navigationService.getAllNavigation().then((apiNav) => {
        if (apiNav && apiNav.items && apiNav.items.length > 0) {
          const shopItem = apiNav.items.find((i: any) => i.id === 'nav-shop' || i.name === 'SHOP');
          if (!shopItem || !shopItem.subGroups || shopItem.subGroups.length >= 9) {
            setNavigationConfig(apiNav);
            localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(apiNav));
          }
        }
      }).catch((e) => console.warn('Could not sync navigation from backend:', e));

      const savedVisitors = localStorage.getItem(STORAGE_KEYS.VISITORS);
      if (savedVisitors) {
        setVisitorLogs(JSON.parse(savedVisitors));
      }
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

  const addProduct = useCallback((productData: Omit<Product, 'id'> & { id?: string }) => {
    const id = productData.id || `prod-${Date.now()}`;
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct: Product = {
      ...productData,
      id,
      slug,
      isFeatured: productData.isFeatured ?? false,
      isNewArrival: productData.isNewArrival ?? true,
      isBestSeller: productData.isBestSeller ?? false,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      variants: productData.variants && productData.variants.length > 0 ? productData.variants : [
        {
          id: `var-${Date.now()}`,
          sku: `${slug.substring(0, 4).toUpperCase()}-STD`,
          price: productData.price,
          stockQuantity: 20,
          size: 'Standard',
          color: 'Natural',
        }
      ],
      images: productData.images && productData.images.length > 0 ? productData.images : [
        { id: `img-${Date.now()}`, url: '/images/products/organic-onesie.jpg', alt: productData.name, position: 1 }
      ],
    };

    saveProducts([newProduct, ...products]);
  }, [products, saveProducts]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    const next = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    saveProducts(next);
  }, [products, saveProducts]);

  const deleteProduct = useCallback((id: string) => {
    const next = products.filter(p => p.id !== id);
    saveProducts(next);
  }, [products, saveProducts]);

  const toggleBestSeller = useCallback((id: string) => {
    const next = products.map(p => {
      if (p.id === id) {
        return { ...p, isBestSeller: !p.isBestSeller };
      }
      return p;
    });
    saveProducts(next);
  }, [products, saveProducts]);

  const toggleFeatured = useCallback((id: string) => {
    const next = products.map(p => {
      if (p.id === id) {
        return { ...p, isFeatured: !p.isFeatured };
      }
      return p;
    });
    saveProducts(next);
  }, [products, saveProducts]);

  const toggleNewArrival = useCallback((id: string) => {
    const next = products.map(p => {
      if (p.id === id) {
        return { ...p, isNewArrival: !p.isNewArrival };
      }
      return p;
    });
    saveProducts(next);
  }, [products, saveProducts]);

  const resetProductsToDefault = useCallback(() => {
    saveProducts(INITIAL_CATALOG_PRODUCTS);
  }, [saveProducts]);

  // Homepage Config
  const updateHomepageConfig = useCallback((
    partial: Partial<HomepageConfig> | ((prev: HomepageConfig) => HomepageConfig)
  ) => {
    setHomepageConfig(prev => {
      const next = typeof partial === 'function' ? partial(prev) : { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  const resetHomepageConfig = useCallback(() => {
    setHomepageConfig(DEFAULT_HOMEPAGE_CONFIG);
    try {
      localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(DEFAULT_HOMEPAGE_CONFIG));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Navigation Config
  const updateNavigationConfig = useCallback((config: NavigationConfig) => {
    setNavigationConfig(config);
    try {
      localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
    // Asynchronously persist to backend API
    navigationService.updateNavigation(config).catch((err) => {
      console.warn('Backend navigation sync failed:', err);
    });
  }, []);

  const addNavItem = useCallback((itemData: Omit<NavItemConfig, 'id'> & { id?: string }) => {
    const id = itemData.id || `nav-${Date.now()}`;
    const nextItems = [...navigationConfig.items, { ...itemData, id }];
    updateNavigationConfig({ items: nextItems });
  }, [navigationConfig, updateNavigationConfig]);

  const updateNavItem = useCallback((itemData: NavItemConfig) => {
    const nextItems = navigationConfig.items.map(item => item.id === itemData.id ? itemData : item);
    updateNavigationConfig({ items: nextItems });
  }, [navigationConfig, updateNavigationConfig]);

  const deleteNavItem = useCallback((id: string) => {
    const nextItems = navigationConfig.items.filter(item => item.id !== id);
    updateNavigationConfig({ items: nextItems });
  }, [navigationConfig, updateNavigationConfig]);

  const resetNavigationConfig = useCallback(() => {
    updateNavigationConfig(DEFAULT_NAVIGATION_CONFIG);
    navigationService.resetNavigation().catch((err) => {
      console.warn('Backend reset navigation failed:', err);
    });
  }, [updateNavigationConfig]);

  // Visitor Tracking & Analytics
  const saveVisitorLogs = useCallback((logs: VisitorLog[]) => {
    setVisitorLogs(logs);
    try {
      localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const trackCurrentVisitor = useCallback(async (page: string = '/') => {
    if (typeof window === 'undefined') return;

    // Check if session already logged to avoid spamming the same session
    const sessionKey = `rexbebe_session_${page}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    try {
      let ip = '112.134.198.' + (Math.floor(Math.random() * 200) + 10);
      let countryCode = 'LK';
      let countryName = 'Sri Lanka';
      let city = 'Colombo';
      let region = 'Western Province';
      let flag = '🇱🇰';

      // Attempt fast public IP detection if online
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.ip) {
            ip = ipData.ip;
            // Detect Geo info from IP
            try {
              const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(2000) });
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.country_name) {
                  countryName = geoData.country_name;
                  countryCode = geoData.country_code || 'LK';
                  city = geoData.city || 'Colombo';
                  region = geoData.region || '';
                  flag = COUNTRY_SEEDS[countryCode]?.flag || '🌍';
                }
              }
            } catch (err) {
              // Ignore geo error
            }
          }
        }
      } catch (err) {
        // Fallback to local device info
      }

      const ua = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
      const isTablet = /iPad|Tablet/i.test(ua);
      const device: 'Desktop' | 'Mobile' | 'Tablet' = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
      const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Browser';

      setVisitorLogs(prev => {
        const existingIdx = prev.findIndex(v => v.ip === ip);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            page,
            timestamp: new Date().toISOString(),
            visitsCount: updated[existingIdx].visitsCount + 1,
            isOnline: true,
          };
          saveVisitorLogs(updated);
          return updated;
        }

        const newLog: VisitorLog = {
          id: `vis-${Date.now()}`,
          ip,
          countryCode,
          countryName,
          city,
          region,
          flag,
          device,
          browser,
          page,
          referrer: document.referrer || 'Direct Visit',
          timestamp: new Date().toISOString(),
          visitsCount: 1,
          isOnline: true,
        };

        const updated = [newLog, ...prev.slice(0, 99)];
        saveVisitorLogs(updated);
        return updated;
      });
    } catch (e) {
      console.warn('Could not auto-track visitor:', e);
    }
  }, [saveVisitorLogs]);

  const simulateVisitor = useCallback((countryCode?: string) => {
    const keys = Object.keys(COUNTRY_SEEDS);
    const code = countryCode && COUNTRY_SEEDS[countryCode] ? countryCode : keys[Math.floor(Math.random() * keys.length)];
    const country = COUNTRY_SEEDS[code];
    const city = country.cities[Math.floor(Math.random() * country.cities.length)];
    const randomIp = `${country.ipPrefix}${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;
    const pages = ['/', '/shop', '/new-in', '/girls', '/boys', '/collections', '/sale', '/baby'];
    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    const devices: ('Desktop' | 'Mobile' | 'Tablet')[] = ['Mobile', 'Desktop', 'Tablet'];
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];
    const browsers = ['Chrome 122', 'Safari Mobile', 'Firefox 124', 'Edge 123'];
    const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];

    const newLog: VisitorLog = {
      id: `vis-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ip: randomIp,
      countryCode: code,
      countryName: country.name,
      city,
      region: city + ' District',
      flag: country.flag,
      device: randomDevice,
      browser: randomBrowser,
      page: randomPage,
      referrer: Math.random() > 0.5 ? 'https://instagram.com/rexbebe' : 'https://google.com',
      timestamp: new Date().toISOString(),
      visitsCount: Math.floor(Math.random() * 3) + 1,
      isOnline: true,
    };

    setVisitorLogs(prev => {
      const next = [newLog, ...prev];
      saveVisitorLogs(next);
      return next;
    });
  }, [saveVisitorLogs]);

  const clearVisitorLogs = useCallback(() => {
    saveVisitorLogs([]);
  }, [saveVisitorLogs]);

  // Compute stats
  const visitorStats: VisitorStats = React.useMemo(() => {
    const totalVisits = visitorLogs.reduce((acc, curr) => acc + curr.visitsCount, 0);
    const uniqueVisitors = new Set(visitorLogs.map(v => v.ip)).size;

    // Top country calculation
    const countryCounts: Record<string, number> = {};
    visitorLogs.forEach(v => {
      countryCounts[v.countryName] = (countryCounts[v.countryName] || 0) + v.visitsCount;
    });

    let topCountry = 'Sri Lanka';
    let topCountryVisits = 0;
    Object.entries(countryCounts).forEach(([name, count]) => {
      if (count > topCountryVisits) {
        topCountry = name;
        topCountryVisits = count;
      }
    });

    const liveVisitors = visitorLogs.filter(v => {
      const diffMs = Date.now() - new Date(v.timestamp).getTime();
      return diffMs < 15 * 60 * 1000; // last 15 minutes
    }).length;

    return {
      totalVisits: totalVisits || 1,
      uniqueVisitors: uniqueVisitors || 1,
      topCountry: topCountry || 'Sri Lanka',
      topCountryVisits: topCountryVisits || 1,
      liveVisitors: Math.max(liveVisitors, 1),
    };
  }, [visitorLogs]);

  return (
    <AdminContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
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

        isLoaded,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
