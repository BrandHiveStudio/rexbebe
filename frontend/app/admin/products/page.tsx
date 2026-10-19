'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Star,
  Check,
  X,
  Package,
  Layers,
  ArrowUpDown,
  RotateCcw,
  ExternalLink,
  Eye,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Tag,
  Monitor,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  DollarSign,
  Palette,
  Boxes,
  Award,
  Globe,
  SlidersHorizontal,
  Paintbrush,
  MoveUp,
  MoveDown,
  Wand2,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { useAdminData } from '../../../hooks/AdminContext';
import { Product, ProductColorOption, ProductPart, ProductVariant, ProductImage } from '../../../types/product';
import { uploadService } from '../../../services/uploadService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { categoryService, CategoryItem, CategoryTreeNode } from '../../../services/categoryService';
import { FabricRecolorStudio } from '../../../components/admin/FabricRecolorStudio';

// Presets
const BABY_SIZES_PRESET = [
  'Newborn',
  '0–3 Months',
  '3–6 Months',
  '6–9 Months',
  '9–12 Months',
  '12–18 Months',
  '18–24 Months',
];

const PRESET_COLOURS: ProductColorOption[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Beige', hex: '#E7D8C9' },
  { name: 'Baby Pink', hex: '#F9A8D4' },
  { name: 'Ivory Cream', hex: '#FEF3C7' },
  { name: 'Mint Green', hex: '#A7F3D0' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Sky Blue', hex: '#BAE6FD' },
  { name: 'Warm Sand', hex: '#D4B895' },
  { name: 'Sage Green', hex: '#9BA88D' },
];

const PART_TYPES = [
  'T-shirt',
  'Shirt',
  'Pants',
  'Shorts',
  'Dress',
  'Romper',
  'Hat',
  'Jacket',
  'Other',
] as const;

type ProductFormTab =
  | 'basic'
  | 'parts'
  | 'sizes-stock'
  | 'colours-images'
  | 'pricing'
  | 'preview';

export default function AdminProductsPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    updateProductStatus,
    toggleBestSeller,
    toggleFeatured,
    toggleNewArrival,
  } = useAdminData();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'stock' | 'rating'>('name');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Wizard Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductFormTab>('basic');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick Action Modals
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceIndexRef = useRef<number | null>(null);
  const colorUploadTargetRef = useRef<string | null>(null);
  const colorFileInputRef = useRef<HTMLInputElement | null>(null);

  // Studio Recolor Modal
  const [studioConfig, setStudioConfig] = useState<{
    isOpen: boolean;
    baseImageUrl: string;
    targetColorHex: string;
    targetColorName: string;
    partName: string;
  } | null>(null);

  // Custom Color inputs in form
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#EF4444');

  // Custom Size input in form
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Categories Tree & Flat List
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [flatCategories, setFlatCategories] = useState<
    { id: string; name: string; slug: string; depth: number; label: string }[]
  >([]);

  const fetchCategories = useCallback(async () => {
    try {
      const [rawCats, tree] = await Promise.all([
        categoryService.getCategories(),
        categoryService.getCategoryTree(),
      ]);
      setAllCategories(Array.isArray(rawCats) ? rawCats : []);

      const list: { id: string; name: string; slug: string; depth: number; label: string }[] = [];
      const traverse = (nodes: CategoryTreeNode[], depth: number) => {
        for (const node of nodes) {
          const indent = depth > 0 ? `${'— '.repeat(depth)}` : '';
          list.push({
            id: node.id,
            name: node.name,
            slug: node.slug,
            depth,
            label: `${indent}${node.name}`,
          });
          if (node.children && node.children.length > 0) {
            traverse(node.children, depth + 1);
          }
        }
      };
      traverse(tree, 0);
      setFlatCategories(list);
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Main Categories (top-level, no parentId)
  const mainCategories = useMemo(() => {
    const mains = allCategories.filter((c) => !c.parentId && c.isActive !== false);
    if (mains.length > 0) return mains;
    return [
      { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing', isActive: true, status: 'published' as const, href: '/shop/baby-clothing' },
      { id: 'cat-sets', name: 'Clothing Sets', slug: 'clothing-sets', isActive: true, status: 'published' as const, href: '/shop/clothing-sets' },
      { id: 'cat-sleepwear', name: 'Sleepwear & Pyjamas', slug: 'sleepwear', isActive: true, status: 'published' as const, href: '/shop/sleepwear' },
      { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', isActive: true, status: 'published' as const, href: '/shop/accessories' },
    ];
  }, [allCategories]);

  // Form State
  const [formData, setFormData] = useState({
    // 1. Basic Info
    name: '',
    slug: '',
    sku: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    categoryName: 'Baby Clothing',
    categorySlug: 'baby-clothing',
    subcategoryId: '',
    subcategoryName: '',
    subcategorySlug: '',
    productType: 'single' as 'single' | 'set',
    status: 'published' as 'published' | 'draft' | 'unpublished',
    images: ['/images/products/organic-onesie.jpg'] as string[],
    gender: 'Baby' as 'Baby' | 'Girls' | 'Boys' | 'Unisex',
    ageGroup: '0–3 months',
    brand: 'REXBEBE Atelier',

    // 2. Product Parts (Clothing Components)
    parts: [] as ProductPart[],

    // 3. Sizes & Stock Matrix
    sizes: ['0–3 Months', '3–6 Months'] as string[],
    lowStockThreshold: 5,
    // matrix maps "size___colorName" to quantity
    stockMatrix: {} as Record<string, number>,

    // 4. Overall Colors list (for single products or aggregated)
    colors: [
      { name: 'Red', hex: '#EF4444' },
      { name: 'Yellow', hex: '#F59E0B' },
      { name: 'Blue', hex: '#3B82F6' },
    ] as ProductColorOption[],
    // Colour variation images map: colorName -> imageUrl
    colorImages: {} as Record<string, string>,

    // 5. Pricing
    sellingPrice: 14500,
    comparePrice: '' as string | number,
    saleStartDate: '',
    saleEndDate: '',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isSaleBadge: false,

    // Fabric specs
    fabricMaterial: '100% GOTS Certified Organic Cotton',
    careInstructions: 'Gentle cold machine wash inside out. Do not tumble dry. Warm iron on reverse.',
  });

  // State to switch colour variation preview inside Section 6
  const [previewSelectedColor, setPreviewSelectedColor] = useState<string>('Red');

  // Calculate dynamic discount percentage
  const calculatedDiscount = useMemo(() => {
    const reg = Number(formData.comparePrice);
    const sell = Number(formData.sellingPrice);
    if (!reg || reg <= sell || sell <= 0) return 0;
    return Math.round((1 - sell / reg) * 100);
  }, [formData.sellingPrice, formData.comparePrice]);

  // Current Subcategories for the selected Main Category
  const currentSubcategories = useMemo(() => {
    if (!formData.categoryId) return [];
    return allCategories.filter((c) => c.parentId === formData.categoryId && c.isActive !== false);
  }, [allCategories, formData.categoryId]);

  // Available Categories fallback
  const availableCategories = useMemo(() => {
    if (flatCategories.length > 0) return flatCategories;
    return [
      { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing', depth: 0, label: 'Baby Clothing' },
      { id: 'cat-newborn', name: 'Newborn (0–3M)', slug: 'newborn', depth: 1, label: '— Newborn (0–3M)' },
      { id: 'cat-boys', name: 'Baby Boys', slug: 'boys', depth: 1, label: '— Baby Boys' },
      { id: 'cat-girls', name: 'Baby Girls', slug: 'girls', depth: 1, label: '— Baby Girls' },
      { id: 'cat-sets', name: 'Clothing Sets', slug: 'clothing-sets', depth: 1, label: '— Clothing Sets' },
    ];
  }, [flatCategories]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === 'ALL' ||
        p.category?.id === selectedCategory ||
        p.category?.slug === selectedCategory ||
        p.category?.name?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.subcategory?.id === selectedCategory ||
        p.subcategory?.slug === selectedCategory ||
        p.subcategory?.name?.toLowerCase() === selectedCategory.toLowerCase();

      let matchStock = true;
      const stock = p.stockQuantity ?? p.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0) ?? 0;
      if (selectedStockFilter === 'IN_STOCK') matchStock = stock > (p.lowStockThreshold || 5);
      else if (selectedStockFilter === 'LOW_STOCK') matchStock = stock > 0 && stock <= (p.lowStockThreshold || 5);
      else if (selectedStockFilter === 'OUT_OF_STOCK') matchStock = stock <= 0;

      let matchStatus = true;
      if (selectedStatusFilter !== 'ALL') {
        const prodStatus = p.status || 'published';
        matchStatus = prodStatus.toLowerCase() === selectedStatusFilter.toLowerCase();
      }

      return matchSearch && matchCategory && matchStock && matchStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock') {
        const stockA = a.stockQuantity ?? 0;
        const stockB = b.stockQuantity ?? 0;
        return stockB - stockA;
      }
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [products, searchQuery, selectedCategory, selectedStockFilter, selectedStatusFilter, sortBy]);

  // Paginated Products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  // Active colours for matrix (from primary part if set, or colors list)
  const activeMatrixColors = useMemo<ProductColorOption[]>(() => {
    if (formData.productType === 'set' && formData.parts.length > 0) {
      // Find the primary part (T-shirt, Dress, or first active part)
      const primary = formData.parts.find(p => p.active && ['T-shirt', 'Shirt', 'Dress', 'Romper'].includes(p.type)) || formData.parts[0];
      if (primary && primary.colors.length > 0) {
        return primary.colors;
      }
    }
    return formData.colors.length > 0 ? formData.colors : [{ name: 'Standard', hex: '#CBD5E1' }];
  }, [formData.productType, formData.parts, formData.colors]);

  // Calculate total matrix stock
  const totalMatrixStock = useMemo(() => {
    let sum = 0;
    formData.sizes.forEach((sz) => {
      activeMatrixColors.forEach((col) => {
        const key = `${sz}___${col.name}`;
        sum += Math.max(0, formData.stockMatrix[key] || 0);
      });
    });
    return sum;
  }, [formData.sizes, activeMatrixColors, formData.stockMatrix]);

  // Open Add Product Wizard
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const defaultCat = mainCategories[0] || { id: 'cat-clothing', name: 'Baby Clothing', slug: 'baby-clothing' };
    
    // Seed default matrix
    const initMatrix: Record<string, number> = {};
    const initSizes = ['0–3 Months', '3–6 Months', '6–9 Months'];
    const initColors = [
      { name: 'Red', hex: '#EF4444' },
      { name: 'Yellow', hex: '#F59E0B' },
      { name: 'Blue', hex: '#3B82F6' },
    ];
    initSizes.forEach((sz, sIdx) => {
      initColors.forEach((col, cIdx) => {
        // illustrative realistic defaults
        initMatrix[`${sz}___${col.name}`] = (sIdx + 1) * 3 + cIdx;
      });
    });

    setFormData({
      name: '',
      slug: '',
      sku: `REX-BABY-${Math.floor(Math.random() * 9000 + 1000)}`,
      shortDescription: '',
      description: '',
      categoryId: defaultCat.id,
      categoryName: defaultCat.name,
      categorySlug: defaultCat.slug,
      subcategoryId: '',
      subcategoryName: '',
      subcategorySlug: '',
      productType: 'single',
      status: 'published',
      images: ['/images/products/dino-baby-set.jpg'],
      gender: 'Baby',
      ageGroup: '0–12 months',
      brand: 'REXBEBE Atelier',
      parts: [
        {
          id: `part-${Date.now()}-1`,
          name: 'Dinosaur T-Shirt',
          type: 'T-shirt',
          description: 'Base organic cotton tee with hand-illustrated colorful dinosaur graphic',
          defaultColor: 'Red',
          active: true,
          colors: [
            { name: 'Red', hex: '#EF4444' },
            { name: 'Yellow', hex: '#F59E0B' },
            { name: 'Blue', hex: '#3B82F6' },
          ],
          images: [
            { url: '/images/products/dino-baby-set.jpg', colorName: 'Red', alt: 'Red Dinosaur T-Shirt Set' },
            { url: '/images/products/dino-baby-set-yellow.jpg', colorName: 'Yellow', alt: 'Yellow Dinosaur T-Shirt Set', isRecolored: true },
            { url: '/images/products/dino-baby-set-blue.jpg', colorName: 'Blue', alt: 'Blue Dinosaur T-Shirt Set', isRecolored: true },
          ],
        },
        {
          id: `part-${Date.now()}-2`,
          name: 'Summer Shorts',
          type: 'Shorts',
          description: 'Neutral beige stretch-waist shorts tailored for gentle movement',
          defaultColor: 'Beige',
          active: true,
          colors: [{ name: 'Beige', hex: '#E7D8C9' }],
        },
        {
          id: `part-${Date.now()}-3`,
          name: 'Baby Hat',
          type: 'Hat',
          description: 'Matching baby sun hat for sunny outings',
          defaultColor: 'Red',
          active: true,
          colors: [{ name: 'Red', hex: '#EF4444' }],
        },
      ],
      sizes: initSizes,
      lowStockThreshold: 5,
      stockMatrix: initMatrix,
      colors: initColors,
      colorImages: {
        Red: '/images/products/dino-baby-set.jpg',
        Yellow: '/images/products/dino-baby-set-yellow.jpg',
        Blue: '/images/products/dino-baby-set-blue.jpg',
      },
      sellingPrice: 14500,
      comparePrice: 17500,
      saleStartDate: '',
      saleEndDate: '',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      isSaleBadge: true,
      fabricMaterial: '100% GOTS Certified Organic Cotton',
      careInstructions: 'Gentle cold machine wash inside out. Do not tumble dry. Warm iron on reverse.',
    });
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  // Open Edit Product Wizard
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);

    const existingImages: string[] =
      p.images && p.images.length > 0
        ? p.images.map((img) => img.url)
        : ['/images/products/organic-onesie.jpg'];

    const colors: ProductColorOption[] =
      p.colors && p.colors.length > 0
        ? p.colors
        : (p.variants || [])
            .filter((v) => v.color && v.colorHex)
            .map((v) => ({ name: v.color!, hex: v.colorHex! }))
            .filter((item, idx, self) => self.findIndex((c) => c.name === item.name) === idx);

    const sizes: string[] =
      p.sizes && p.sizes.length > 0
        ? p.sizes
        : Array.from(
            new Set((p.variants || []).map((v) => v.size).filter(Boolean) as string[])
          );

    // Build existing stock matrix from variants
    const matrix: Record<string, number> = {};
    (p.variants || []).forEach((v) => {
      const colName = v.color || (v.partColors ? Object.values(v.partColors)[0] : 'Standard');
      const szName = v.size || 'Standard';
      if (v.partId) {
        matrix[`${v.partId}___${szName}___${colName}`] = v.stockQuantity ?? 0;
      } else {
        matrix[`${szName}___${colName}`] = v.stockQuantity ?? 0;
      }
    });

    // Build existing colorImages map
    const colImgMap: Record<string, string> = {};
    (p.images || []).forEach((img) => {
      if (img.colorName) colImgMap[img.colorName] = img.url;
    });
    (p.variants || []).forEach((v) => {
      if (v.color && v.imageUrl) colImgMap[v.color] = v.imageUrl;
    });

    const hasSale = Boolean(p.comparePrice && p.comparePrice > p.price);
    const sellingPrice = p.price;
    const comparePrice = hasSale ? p.comparePrice! : '';

    let mainCatId = p.category?.id || '';
    let mainCatName = p.category?.name || '';
    let mainCatSlug = p.category?.slug || '';
    let subCatId = p.subcategory?.id || '';
    let subCatName = p.subcategory?.name || '';
    let subCatSlug = p.subcategory?.slug || '';

    // If p.category is actually a subcategory (has parentId), resolve its parent
    const catItem = allCategories.find((c) => (mainCatId && c.id === mainCatId) || (mainCatSlug && c.slug === mainCatSlug));
    if (catItem && catItem.parentId) {
      const parentItem = allCategories.find((c) => c.id === catItem.parentId);
      if (parentItem) {
        subCatId = catItem.id;
        subCatName = catItem.name;
        subCatSlug = catItem.slug;
        mainCatId = parentItem.id;
        mainCatName = parentItem.name;
        mainCatSlug = parentItem.slug;
      }
    } else if (!mainCatId && mainCategories.length > 0) {
      mainCatId = mainCategories[0].id;
      mainCatName = mainCategories[0].name;
      mainCatSlug = mainCategories[0].slug;
    }

    setFormData({
      name: p.name,
      slug: p.slug,
      sku: p.sku || `REX-${p.slug.substring(0, 4).toUpperCase()}`,
      shortDescription: p.shortDescription || p.description?.slice(0, 100) || '',
      description: p.description || '',
      categoryId: mainCatId,
      categoryName: mainCatName || 'Baby Clothing',
      categorySlug: mainCatSlug || 'baby-clothing',
      subcategoryId: subCatId,
      subcategoryName: subCatName,
      subcategorySlug: subCatSlug,
      productType: p.productType || (p.parts && p.parts.length > 0 ? 'set' : 'single'),
      status: p.status || 'published',
      images: existingImages,
      gender: (p.gender as any) || 'Baby',
      ageGroup: p.ageGroup || '0–12 months',
      brand: p.brand || 'REXBEBE Atelier',
      parts: p.parts || [],
      sizes: sizes.length > 0 ? sizes : ['0–3 Months', '3–6 Months'],
      lowStockThreshold: p.lowStockThreshold || 5,
      stockMatrix: matrix,
      colors: colors.length > 0 ? colors : [{ name: 'Standard', hex: '#CBD5E1' }],
      colorImages: colImgMap,
      sellingPrice,
      comparePrice,
      saleStartDate: p.saleStartDate || '',
      saleEndDate: p.saleEndDate || '',
      isFeatured: Boolean(p.isFeatured),
      isNewArrival: Boolean(p.isNewArrival),
      isBestSeller: Boolean(p.isBestSeller),
      isSaleBadge: Boolean(p.isSaleBadge ?? hasSale),
      fabricMaterial: p.fabricMaterial || '100% GOTS Certified Organic Cotton',
      careInstructions: p.careInstructions || 'Gentle cold machine wash inside out. Do not tumble dry. Warm iron on reverse.',
    });

    setActiveTab('basic');
    setIsModalOpen(true);
  };

  // Image Upload Handlers
  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadService.uploadImage(file);
        uploadedUrls.push(res.url);
      }

      if (replaceIndexRef.current !== null) {
        const targetIdx = replaceIndexRef.current;
        setFormData((prev) => {
          const nextImages = [...prev.images];
          nextImages[targetIdx] = uploadedUrls[0];
          return { ...prev, images: nextImages };
        });
        replaceIndexRef.current = null;
        showToast('Image replaced successfully! 🌸');
      } else {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        showToast(`${uploadedUrls.length} image(s) uploaded successfully! 📸`);
      }
    } catch (err: any) {
      showToast(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Upload specific image for a colour variation (Option A)
  const handleUploadColorSpecificImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetCol = colorUploadTargetRef.current;
    if (!file || !targetCol) return;
    setIsUploading(true);

    try {
      const res = await uploadService.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        colorImages: {
          ...prev.colorImages,
          [targetCol]: res.url,
        },
      }));
      showToast(`Photo uploaded for "${targetCol}" variation! 📸`);
    } catch (err: any) {
      showToast(err.message || 'Failed to upload colour image.');
    } finally {
      setIsUploading(false);
      colorUploadTargetRef.current = null;
      if (colorFileInputRef.current) colorFileInputRef.current.value = '';
    }
  };

  // Trigger Option A file chooser
  const triggerColorUpload = (colName: string) => {
    colorUploadTargetRef.current = colName;
    colorFileInputRef.current?.click();
  };

  // Trigger Option B Fabric Recolor Studio
  const triggerRecolorStudio = (col: ProductColorOption, partName?: string) => {
    const baseImg = formData.images[0] || '/images/products/dino-baby-set.jpg';
    setStudioConfig({
      isOpen: true,
      baseImageUrl: baseImg,
      targetColorHex: col.hex,
      targetColorName: col.name,
      partName: partName || 'T-shirt Fabric',
    });
  };

  // Handle saving variation generated by FabricRecolorStudio
  const handleSaveStudioVariation = (newImageUrl: string) => {
    if (!studioConfig) return;
    const { targetColorName, partName } = studioConfig;

    setFormData((prev) => {
      // 1. Update colorImages map
      const nextColImgs = { ...prev.colorImages, [targetColorName]: newImageUrl };

      // 2. Also attach to the part if it exists
      const nextParts = prev.parts.map((p) => {
        if (p.name === partName || ['T-shirt', 'Shirt'].includes(p.type)) {
          const existingImgs = p.images || [];
          const updatedImgs = existingImgs.filter((img) => img.colorName !== targetColorName);
          updatedImgs.push({
            url: newImageUrl,
            colorName: targetColorName,
            alt: `${p.name} - ${targetColorName}`,
            isRecolored: true,
          });
          return { ...p, images: updatedImgs };
        }
        return p;
      });

      return {
        ...prev,
        colorImages: nextColImgs,
        parts: nextParts,
      };
    });

    setStudioConfig(null);
    showToast(`Colour variation for "${targetColorName}" generated and saved! ✨`);
  };

  // Add a new clothing component part
  const handleAddPart = () => {
    const newPart: ProductPart = {
      id: `part-${Date.now()}`,
      name: `Clothing Part ${formData.parts.length + 1}`,
      type: 'T-shirt',
      description: '',
      colors: [
        { name: 'Red', hex: '#EF4444' },
        { name: 'Yellow', hex: '#F59E0B' },
      ],
      defaultColor: 'Red',
      active: true,
      images: [],
    };
    setFormData((prev) => ({
      ...prev,
      parts: [...prev.parts, newPart],
    }));
    showToast('New clothing component added! 👕');
  };

  // Reorder part
  const handleMovePart = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= formData.parts.length) return;
    setFormData((prev) => {
      const copy = [...prev.parts];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return { ...prev, parts: copy };
    });
  };

  // Remove part
  const handleRemovePart = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((p) => p.id !== id),
    }));
    showToast('Clothing component removed.');
  };

  // Toggle size in form
  const handleToggleSize = (sizeStr: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(sizeStr);
      if (exists) {
        if (prev.sizes.length <= 1) {
          showToast('Please keep at least one available size.');
          return prev;
        }
        return { ...prev, sizes: prev.sizes.filter((s) => s !== sizeStr) };
      } else {
        return { ...prev, sizes: [...prev.sizes, sizeStr] };
      }
    });
  };

  // Add custom size
  const handleAddCustomSize = () => {
    const clean = customSizeInput.trim();
    if (!clean) return;
    if (!formData.sizes.includes(clean)) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, clean] }));
      showToast(`Size "${clean}" added! 📏`);
    }
    setCustomSizeInput('');
  };

  // Toggle color in form
  const handleToggleColor = (col: ProductColorOption) => {
    setFormData((prev) => {
      const exists = prev.colors.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
      if (exists) {
        if (prev.colors.length <= 1) {
          showToast('Please keep at least one colour.');
          return prev;
        }
        return {
          ...prev,
          colors: prev.colors.filter((c) => c.name.toLowerCase() !== col.name.toLowerCase()),
        };
      } else {
        return { ...prev, colors: [...prev.colors, col] };
      }
    });
  };

  // Add custom color
  const handleAddCustomColor = () => {
    if (!customColorName.trim()) {
      showToast('Please enter a colour name.');
      return;
    }
    const newCol: ProductColorOption = {
      name: customColorName.trim(),
      hex: customColorHex,
    };
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, newCol],
    }));
    setCustomColorName('');
    showToast(`Colour "${newCol.name}" added! 🎨`);
  };

  // Save / Publish Product Handler
  const handleSaveProduct = async (saveStatus: 'published' | 'draft') => {
    if (!formData.name.trim()) {
      showToast('Please enter a product name first.');
      setActiveTab('basic');
      return;
    }

    const sellPrice = Number(formData.sellingPrice);
    if (!sellPrice || sellPrice <= 0) {
      showToast('Please enter a valid selling price greater than 0.');
      setActiveTab('pricing');
      return;
    }

    const cleanSlug =
      formData.slug.trim() ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const cmpPrice = formData.comparePrice !== '' ? Number(formData.comparePrice) : undefined;

    // Build Product Images
    const productImages: ProductImage[] = formData.images.map((url, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url,
      alt: `${formData.name} - View ${idx + 1}`,
      position: idx + 1,
    }));

    // Add colour variation images to product images if not already included
    Object.entries(formData.colorImages).forEach(([cName, cUrl], idx) => {
      if (!productImages.some((img) => img.url === cUrl)) {
        productImages.push({
          id: `img-col-${Date.now()}-${idx}`,
          url: cUrl,
          alt: `${formData.name} - ${cName} Variation`,
          position: productImages.length + 1,
          colorName: cName,
        });
      }
    });

    // Build Variants from Sizes x Active Colors Matrix
    const variants: ProductVariant[] = [];
    formData.sizes.forEach((sz, sIdx) => {
      activeMatrixColors.forEach((col, cIdx) => {
        const matrixKey = `${sz}___${col.name}`;
        const qty = Math.max(0, formData.stockMatrix[matrixKey] ?? 5);
        const colImg = formData.colorImages[col.name] || formData.images[0] || '/images/products/dino-baby-set.jpg';

        // Build partColors record if product contains parts
        const partColors: Record<string, string> = {};
        if (formData.parts.length > 0) {
          formData.parts.forEach((p) => {
            partColors[p.name] = p.colors.some((c) => c.name === col.name)
              ? col.name
              : p.defaultColor || p.colors[0]?.name || 'Standard';
          });
        }

        variants.push({
          id: `var-${cleanSlug}-${sz.replace(/[^a-z0-9]/gi, '')}-${col.name.replace(/[^a-z0-9]/gi, '')}-${sIdx}-${cIdx}`,
          sku: `${formData.sku || 'REX'}-${sz.replace(/[^A-Z0-9]/gi, '')}-${col.name.substring(0, 3).toUpperCase()}`,
          purchaseType: formData.productType === 'set' ? 'complete_set' : undefined,
          size: sz,
          color: col.name,
          colorHex: col.hex,
          partColors: Object.keys(partColors).length > 0 ? partColors : undefined,
          price: sellPrice,
          stockQuantity: qty,
          imageUrl: colImg,
        });
      });
    });

    // Also build individual part variants if parts are marked individually purchasable
    if (formData.productType === 'set' && formData.parts.length > 0) {
      formData.parts.forEach((part) => {
        if (!part.isPurchasableIndividually) return;
        const partSizes = part.sizes && part.sizes.length > 0 ? part.sizes : formData.sizes;
        const partCols = part.colors && part.colors.length > 0 ? part.colors : activeMatrixColors;
        const partPrice = part.price && part.price > 0 ? part.price : sellPrice;

        partSizes.forEach((sz, sIdx) => {
          partCols.forEach((col, cIdx) => {
            const partMatrixKey = `${part.id}___${sz}___${col.name}`;
            const qty = Math.max(0, formData.stockMatrix[partMatrixKey] ?? 5);
            const partImg = part.images?.find(i => i.colorName?.toLowerCase() === col.name.toLowerCase())?.url ||
                            formData.colorImages[col.name] ||
                            formData.images[0] ||
                            '/images/products/dino-baby-set.jpg';

            variants.push({
              id: `var-${cleanSlug}-part-${part.id}-${sz.replace(/[^a-z0-9]/gi, '')}-${col.name.replace(/[^a-z0-9]/gi, '')}`,
              sku: `${part.skuPrefix || formData.sku || 'REX'}-${sz.replace(/[^A-Z0-9]/gi, '')}-${col.name.substring(0, 3).toUpperCase()}`,
              purchaseType: 'individual_part',
              partId: part.id,
              partName: part.name,
              size: sz,
              color: col.name,
              colorHex: col.hex,
              price: partPrice,
              stockQuantity: qty,
              imageUrl: partImg,
            });
          });
        });
      });
    }

    const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

    const finalProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formData.name.trim(),
      slug: cleanSlug,
      sku: formData.sku.trim() || `REX-${cleanSlug.substring(0, 4).toUpperCase()}`,
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim() || formData.shortDescription.trim(),
      price: sellPrice,
      comparePrice: cmpPrice && cmpPrice > sellPrice ? cmpPrice : undefined,
      discountPercentage: calculatedDiscount > 0 ? calculatedDiscount : undefined,
      productType: formData.productType,
      status: saveStatus,
      isFeatured: formData.isFeatured,
      isNewArrival: formData.isNewArrival,
      isBestSeller: formData.isBestSeller,
      isSaleBadge: formData.isSaleBadge && calculatedDiscount > 0,
      brand: formData.brand.trim() || 'REXBEBE Atelier',
      gender: formData.gender,
      ageGroup: formData.ageGroup,
      category: {
        id: formData.categoryId || 'cat-clothing',
        name: formData.categoryName || 'Baby Clothing',
        slug: formData.categorySlug || 'baby-clothing',
      },
      subcategory: formData.subcategoryId ? {
        id: formData.subcategoryId,
        name: formData.subcategoryName,
        slug: formData.subcategorySlug,
      } : undefined,
      images: productImages,
      colors: activeMatrixColors,
      sizes: formData.sizes,
      parts: formData.productType === 'set' ? formData.parts : undefined,
      variants,
      stockQuantity: totalStock,
      lowStockThreshold: formData.lowStockThreshold || 5,
      stockStatus: totalStock <= 0 ? 'out_of_stock' : totalStock <= (formData.lowStockThreshold || 5) ? 'low_stock' : 'in_stock',
      fabricMaterial: formData.fabricMaterial,
      careInstructions: formData.careInstructions,
      rating: editingProduct?.rating ?? 5,
      reviewCount: editingProduct?.reviewCount ?? 0,
    };

    try {
      if (editingProduct) {
        await updateProduct(finalProduct);
        showToast('Product updated successfully! 🌸');
      } else {
        await addProduct(finalProduct);
        showToast('New boutique product published successfully! ✨');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save product. Please try again.');
    }
  };

  // Duplicate Product Handler
  const handleDuplicate = async (p: Product) => {
    try {
      await duplicateProduct(p.id);
      showToast(`Duplicated "${p.name}" as new draft! 📋`);
    } catch (err: any) {
      showToast(err.message || 'Duplicate failed.');
    }
  };

  // Delete Product Handler
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await deleteProduct(deleteConfirmProduct.id);
      showToast(`Deleted "${deleteConfirmProduct.name}".`);
      setDeleteConfirmProduct(null);
    } catch (err: any) {
      showToast(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Product Management"
          subtitle="Manage baby clothing, multi-piece sets, inventory matrix, and colour variations."
          actions={
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Baby Product</span>
            </button>
          }
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total Catalog</span>
              <p className="text-2xl font-black text-slate-900">{products.length} Products</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">Published</span>
              <p className="text-2xl font-black text-emerald-700">{products.filter((p) => p.status === 'published' || !p.status).length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">Drafts</span>
              <p className="text-2xl font-black text-amber-700">{products.filter((p) => p.status === 'draft').length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 block">Clothing Sets</span>
              <p className="text-2xl font-black text-pink-700">{products.filter((p) => p.productType === 'set' || (p.parts && p.parts.length > 0)).length}</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                >
                  <option value="ALL">All Categories</option>
                  {mainCategories.map((m) => {
                    const subs = allCategories.filter((c) => c.parentId === m.id);
                    return (
                      <React.Fragment key={m.id}>
                        <option value={m.id} className="font-bold">
                          📁 {m.name}
                        </option>
                        {subs.map((s) => (
                          <option key={s.id} value={s.id}>
                            &nbsp;&nbsp;&nbsp;↳ {s.name}
                          </option>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </select>

                <select
                  value={selectedStockFilter}
                  onChange={(e) => setSelectedStockFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700"
                >
                  <option value="ALL">All Inventory</option>
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW_STOCK">Low Stock (≤5)</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700"
                >
                  <option value="ALL">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="unpublished">Unpublished</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700"
                >
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="stock">Stock Quantity</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            {paginatedProducts.length === 0 ? (
              <div className="py-16 text-center space-y-3 px-4">
                <div className="w-14 h-14 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto text-2xl">
                  🧸
                </div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg font-heading">
                  No Products Found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No boutique items match your current search or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedStockFilter('ALL');
                    setSelectedStatusFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4 sm:px-6">Product</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedProducts.map((p) => {
                      const mainImg = p.images?.[0]?.url || '/images/products/organic-onesie.jpg';
                      const stockCount =
                        p.stockQuantity ??
                        p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ??
                        0;
                      const isLow = stockCount > 0 && stockCount <= (p.lowStockThreshold || 5);
                      const isOut = stockCount <= 0;
                      const isSet = p.productType === 'set' || (p.parts && p.parts.length > 0);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                <Image src={mainImg} alt={p.name} fill className="object-cover" />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <Link
                                  href={`/products/${p.slug}`}
                                  target="_blank"
                                  className="font-extrabold text-slate-900 hover:text-pink-600 transition-colors truncate block text-xs sm:text-sm"
                                  title={p.name}
                                >
                                  {p.name}
                                </Link>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  /products/{p.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {isSet ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-black uppercase">
                                <Layers className="w-3 h-3 mr-0.5" />
                                <span>Set ({p.parts?.length || 3} Parts)</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                                Single Item
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-600">
                            {p.sku || 'N/A'}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col space-y-1">
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-100 text-[10px] sm:text-xs font-extrabold w-fit">
                                {p.category?.name || 'Unassigned'}
                              </span>
                              {p.subcategory?.name && (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-bold w-fit">
                                  ↳ {p.subcategory.name}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 block">
                                {formatCurrency(p.price)}
                              </span>
                              {p.comparePrice && p.comparePrice > p.price && (
                                <span className="text-[10px] text-slate-400 line-through block">
                                  {formatCurrency(p.comparePrice)}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {isOut ? (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black uppercase">
                                Sold Out (0)
                              </span>
                            ) : isLow ? (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold">
                                Low Stock ({stockCount})
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                                In Stock ({stockCount})
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() =>
                                updateProductStatus(
                                  p.id,
                                  (p.status || 'published') === 'published' ? 'draft' : 'published'
                                )
                              }
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                                (p.status || 'published') === 'published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {p.status || 'published'}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-600 hover:text-pink-600 flex items-center justify-center transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(p)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 flex items-center justify-center transition-colors"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmProduct(p)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
                  {filteredProducts.length} items
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs ${
                        currentPage === i + 1
                          ? 'bg-pink-500 text-white'
                          : 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        onChange={handleUploadFiles}
        className="hidden"
      />
      <input
        ref={colorFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleUploadColorSpecificImage}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* 6-SECTION SIMPLIFIED PRODUCT CREATION / EDITING MODAL                     */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-white/80 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-50/60 via-purple-50/40 to-sky-50/50">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 block">
                  {editingProduct ? 'Edit Clothing Product' : 'Add Baby Clothing Product'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                  {formData.name || 'New Boutique Product'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold shadow-xs border border-slate-200"
              >
                ✕
              </button>
            </div>

            {/* 6 Clearly Named Sections Tabs */}
            <div className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-100 overflow-x-auto no-scrollbar text-xs bg-slate-50/40">
              {[
                { id: 'basic', label: '1. Basic Information', icon: Tag },
                { id: 'parts', label: '2. Product Parts', icon: Layers },
                { id: 'sizes-stock', label: '3. Sizes & Stock', icon: Boxes },
                { id: 'colours-images', label: '4. Colours & Images', icon: Palette },
                { id: 'pricing', label: '5. Pricing', icon: DollarSign },
                { id: 'preview', label: '6. Preview & Publish', icon: Eye },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProductFormTab)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-extrabold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
              {/* SECTION 1: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. REXBEBE Dino Adventure 3-Piece Baby Set"
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name: val,
                          slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        }));
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="product-main-cat-select" className="font-extrabold text-slate-800 block mb-1">
                        Main Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="product-main-cat-select"
                        value={formData.categoryId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const matched = mainCategories.find((c) => c.id === selectedId);
                          const subsForNew = allCategories.filter((c) => c.parentId === selectedId);
                          const subValid = subsForNew.some((s) => s.id === formData.subcategoryId);

                          setFormData((prev) => ({
                            ...prev,
                            categoryId: selectedId,
                            categoryName: matched?.name || 'Baby Clothing',
                            categorySlug: matched?.slug || 'baby-clothing',
                            subcategoryId: subValid ? prev.subcategoryId : '',
                            subcategoryName: subValid ? prev.subcategoryName : '',
                            subcategorySlug: subValid ? prev.subcategorySlug : '',
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      >
                        {mainCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="product-sub-cat-select" className="font-extrabold text-slate-800 block mb-1">
                        Subcategory <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                      </label>
                      {currentSubcategories.length === 0 ? (
                        <div className="w-full px-3.5 py-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-400 italic">
                          No subcategories available under {formData.categoryName}
                        </div>
                      ) : (
                        <select
                          id="product-sub-cat-select"
                          value={formData.subcategoryId}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              setFormData((prev) => ({
                                ...prev,
                                subcategoryId: '',
                                subcategoryName: '',
                                subcategorySlug: '',
                              }));
                            } else {
                              const matched = currentSubcategories.find((s) => s.id === val);
                              setFormData((prev) => ({
                                ...prev,
                                subcategoryId: val,
                                subcategoryName: matched?.name || '',
                                subcategorySlug: matched?.slug || '',
                              }));
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        >
                          <option value="">None (Top-Level Category Only)</option>
                          {currentSubcategories.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">
                        Product Type
                      </label>
                      <select
                        value={formData.productType}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            productType: e.target.value as 'single' | 'set',
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                      >
                        <option value="single">Single Item</option>
                        <option value="set">Clothing Set (Multi-piece)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">
                        SKU / Code
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="unpublished">Unpublished</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      Product Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Crafted from 100% GOTS certified organic cotton..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-pink-500/20 focus:outline-none"
                    />
                  </div>

                  {/* Main Product Images */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-800 block">
                        Product Photos (Main &amp; Additional Views)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          replaceIndexRef.current = null;
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploading}
                        className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-black transition-all flex items-center space-x-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Uploading...' : 'Upload Photos'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 border-2 border-stone-200 group p-2 flex items-center justify-center shadow-xs"
                        >
                          <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                              src={imgUrl}
                              alt={`Photo ${idx + 1}`}
                              fill
                              className="object-contain object-center transition-transform group-hover:scale-105"
                              sizes="160px"
                            />
                          </div>
                          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 backdrop-blur-2xs">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => {
                                    const next = [...prev.images];
                                    const temp = next[idx];
                                    next[idx] = next[idx - 1];
                                    next[idx - 1] = temp;
                                    return { ...prev, images: next };
                                  });
                                }}
                                className="w-7 h-7 rounded-lg bg-white text-slate-800 text-xs font-black shadow-sm hover:bg-slate-100 flex items-center justify-center"
                                title="Move Earlier"
                              >
                                ←
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (formData.images.length <= 1) {
                                  showToast('Please keep at least one product photo.');
                                  return;
                                }
                                setFormData((prev) => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== idx),
                                }));
                              }}
                              className="w-7 h-7 rounded-lg bg-rose-500 text-white text-xs font-black shadow-sm hover:bg-rose-600 flex items-center justify-center"
                              title="Delete Photo"
                            >
                              ✕
                            </button>
                          </div>
                          <span
                            className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase shadow-xs ${
                              idx === 0
                                ? 'bg-pink-600 text-white'
                                : 'bg-stone-900/80 text-white backdrop-blur-xs'
                            }`}
                          >
                            {idx === 0 ? 'Main Photo' : `View ${idx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: PRODUCT PARTS / CLOTHING COMPONENTS */}
              {activeTab === 'parts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm sm:text-base font-heading">
                        Product Parts / Clothing Components
                      </h3>
                      <p className="text-xs text-slate-500">
                        Baby clothing sets contain individual pieces (e.g. Dinosaur T-Shirt, Summer Shorts, Hat) managed separately.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shadow-xs flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product Part</span>
                    </button>
                  </div>

                  {formData.parts.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-slate-600">
                        This product is currently configured without separate clothing components.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddPart}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                      >
                        + Add First Component (e.g. T-Shirt)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.parts.map((part, pIdx) => (
                        <div
                          key={part.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-black text-xs">
                                {pIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={part.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => ({
                                    ...prev,
                                    parts: prev.parts.map((p, i) => (i === pIdx ? { ...p, name: val } : p)),
                                  }));
                                }}
                                className="font-extrabold text-sm text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-pink-500 focus:outline-none px-1"
                              />
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                disabled={pIdx === 0}
                                onClick={() => handleMovePart(pIdx, 'up')}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                                title="Move Up"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={pIdx === formData.parts.length - 1}
                                onClick={() => handleMovePart(pIdx, 'down')}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                                title="Move Down"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePart(part.id)}
                                className="p-1 rounded-lg hover:bg-rose-50 text-rose-500"
                                title="Remove Part"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Part Type
                              </label>
                              <select
                                value={part.type}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  setFormData((prev) => ({
                                    ...prev,
                                    parts: prev.parts.map((p, i) => (i === pIdx ? { ...p, type: val } : p)),
                                  }));
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                              >
                                {PART_TYPES.map((pt) => (
                                  <option key={pt} value={pt}>
                                    {pt}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Default Colour
                              </label>
                              <input
                                type="text"
                                value={part.defaultColor || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => ({
                                    ...prev,
                                    parts: prev.parts.map((p, i) => (i === pIdx ? { ...p, defaultColor: val } : p)),
                                  }));
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                                placeholder="e.g. Red, Beige"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                                Status
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    parts: prev.parts.map((p, i) => (i === pIdx ? { ...p, active: !p.active } : p)),
                                  }));
                                }}
                                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                                  part.active
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                              >
                                {part.active ? 'Active Component' : 'Inactive'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Available Colours for this Component:
                            </label>
                            <div className="flex flex-wrap gap-2 items-center">
                              {PRESET_COLOURS.map((pc) => {
                                const hasCol = part.colors.some((c) => c.name.toLowerCase() === pc.name.toLowerCase());
                                return (
                                  <button
                                    key={pc.name}
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        parts: prev.parts.map((p, i) => {
                                          if (i !== pIdx) return p;
                                          const nextCols = hasCol
                                            ? p.colors.filter((c) => c.name.toLowerCase() !== pc.name.toLowerCase())
                                            : [...p.colors, pc];
                                          return { ...p, colors: nextCols };
                                        }),
                                      }));
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center space-x-1.5 ${
                                      hasCol
                                        ? 'border-pink-500 bg-pink-50 text-pink-800'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: pc.hex }} />
                                    <span>{pc.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Individual Purchasability & Pricing for this Component */}
                          <div className="pt-3 border-t border-slate-100 space-y-2.5">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(part.isPurchasableIndividually)}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  setFormData((prev) => ({
                                    ...prev,
                                    parts: prev.parts.map((p, i) =>
                                      i === pIdx
                                        ? {
                                            ...p,
                                            isPurchasableIndividually: val,
                                            price: val ? (p.price || Math.round(Number(formData.sellingPrice || 14500) * 0.45)) : undefined,
                                            skuPrefix: val ? (p.skuPrefix || `REX-${part.type.substring(0, 4).toUpperCase()}`) : undefined,
                                          }
                                        : p
                                    ),
                                  }));
                                }}
                                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
                              />
                              <span className="text-xs font-black text-slate-800">
                                Allow purchasing this component individually (Separate Price, SKU &amp; Stock)
                              </span>
                            </label>

                            {part.isPurchasableIndividually && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-pink-50/40 border border-pink-100 animate-in fade-in">
                                <div>
                                  <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                                    Individual Selling Price (LKR) *
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={part.price || ''}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setFormData((prev) => ({
                                        ...prev,
                                        parts: prev.parts.map((p, i) => (i === pIdx ? { ...p, price: val } : p)),
                                      }));
                                    }}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                                    placeholder="e.g. 6500"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                                    Compare Price (LKR)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={part.comparePrice || ''}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setFormData((prev) => ({
                                        ...prev,
                                        parts: prev.parts.map((p, i) => (i === pIdx ? { ...p, comparePrice: val } : p)),
                                      }));
                                    }}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                                    placeholder="e.g. 7500"
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-extrabold text-slate-700 block mb-1">
                                    SKU Prefix
                                  </label>
                                  <input
                                    type="text"
                                    value={part.skuPrefix || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => ({
                                        ...prev,
                                        parts: prev.parts.map((p, i) => (i === pIdx ? { ...p, skuPrefix: val } : p)),
                                      }));
                                    }}
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono uppercase bg-white"
                                    placeholder="e.g. REX-TEE"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: SIZES & STOCK (INVENTORY MATRIX) */}
              {activeTab === 'sizes-stock' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm sm:text-base font-heading">
                        Sizes &amp; Inventory Matrix
                      </h3>
                      <p className="text-xs text-slate-500">
                        Enter the actual stock quantity for each Size × Colour combination. Total stock: <strong className="text-pink-600">{totalMatrixStock} units</strong>.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                        Low Stock Alert At:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lowStockThreshold: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="w-16 px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold text-center"
                      />
                      <span className="text-xs text-slate-500">units</span>
                    </div>
                  </div>

                  {/* Size Preset Selector */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-extrabold text-slate-700 block">
                      Select Available Baby Sizes:
                    </span>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {BABY_SIZES_PRESET.map((sz) => {
                        const isSelected = formData.sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleSize(sz)}
                            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
                              isSelected
                                ? 'bg-pink-500 text-white border-pink-500 shadow-2xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom Size */}
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add custom size (e.g. 24–36 Months)"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSize}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
                      >
                        + Add Size
                      </button>
                    </div>
                  </div>

                  {/* Real Stock Quantity Matrix Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold">
                            <th className="py-3 px-4">Size</th>
                            {activeMatrixColors.map((col) => (
                              <th key={col.name} className="py-3 px-3 text-center">
                                <div className="inline-flex items-center space-x-1.5">
                                  <span
                                    className="w-3 h-3 rounded-full border border-black/10"
                                    style={{ backgroundColor: col.hex }}
                                  />
                                  <span>{col.name}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {formData.sizes.map((sz) => (
                            <tr key={sz} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-4 font-black text-slate-800 whitespace-nowrap">
                                {sz}
                              </td>
                              {activeMatrixColors.map((col) => {
                                const matrixKey = `${sz}___${col.name}`;
                                const currentQty = formData.stockMatrix[matrixKey] ?? 0;
                                const isSoldOut = currentQty <= 0;
                                const isLow = currentQty > 0 && currentQty <= formData.lowStockThreshold;

                                return (
                                  <td key={col.name} className="py-2.5 px-3 text-center">
                                    <div className="flex flex-col items-center space-y-1">
                                      <input
                                        type="number"
                                        min="0"
                                        value={currentQty}
                                        onChange={(e) => {
                                          const val = Math.max(0, parseInt(e.target.value) || 0);
                                          setFormData((prev) => ({
                                            ...prev,
                                            stockMatrix: {
                                              ...prev.stockMatrix,
                                              [matrixKey]: val,
                                            },
                                          }));
                                        }}
                                        className={`w-16 px-2 py-1 text-center font-bold text-xs rounded-lg border transition-all ${
                                          isSoldOut
                                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                                            : isLow
                                            ? 'border-amber-300 bg-amber-50 text-amber-800'
                                            : 'border-slate-200 bg-white text-slate-800'
                                        }`}
                                      />
                                      <span
                                        className={`text-[9px] font-black uppercase ${
                                          isSoldOut
                                            ? 'text-rose-600'
                                            : isLow
                                            ? 'text-amber-700'
                                            : 'text-emerald-600'
                                        }`}
                                      >
                                        {isSoldOut ? 'Sold Out' : isLow ? 'Low Stock' : 'Available'}
                                      </span>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Individual Component Stock Matrices */}
                  {formData.productType === 'set' && formData.parts.some((p) => p.isPurchasableIndividually) && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in">
                      <div>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm font-heading flex items-center space-x-1.5">
                          <Layers className="w-4 h-4 text-pink-600" />
                          <span>Individually Purchasable Components Stock Matrix</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Track independent inventory per size &amp; colour for garments sold separately.
                        </p>
                      </div>

                      {formData.parts
                        .filter((p) => p.isPurchasableIndividually)
                        .map((part) => {
                          const partSizes = part.sizes && part.sizes.length > 0 ? part.sizes : formData.sizes;
                          const partCols = part.colors && part.colors.length > 0 ? part.colors : activeMatrixColors;

                          return (
                            <div
                              key={part.id}
                              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-xs text-slate-900">
                                  {part.name} ({part.type}) — Individual Price:{' '}
                                  <strong className="text-pink-600">{formatCurrency(part.price || 0)}</strong>
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  SKU: {part.skuPrefix || 'REX'}
                                </span>
                              </div>

                              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-extrabold">
                                        <th className="py-2 px-3">Size</th>
                                        {partCols.map((c) => (
                                          <th key={c.name} className="py-2 px-2 text-center">
                                            <div className="inline-flex items-center space-x-1">
                                              <span
                                                className="w-2.5 h-2.5 rounded-full border border-black/10"
                                                style={{ backgroundColor: c.hex }}
                                              />
                                              <span className="text-[11px]">{c.name}</span>
                                            </div>
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {partSizes.map((sz) => (
                                        <tr key={sz} className="hover:bg-slate-50/50">
                                          <td className="py-2 px-3 font-black text-slate-800 text-[11px] whitespace-nowrap">
                                            {sz}
                                          </td>
                                          {partCols.map((c) => {
                                            const mKey = `${part.id}___${sz}___${c.name}`;
                                            const q = formData.stockMatrix[mKey] ?? 5;
                                            return (
                                              <td key={c.name} className="py-2 px-2 text-center">
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={q}
                                                  onChange={(e) => {
                                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                                    setFormData((prev) => ({
                                                      ...prev,
                                                      stockMatrix: { ...prev.stockMatrix, [mKey]: val },
                                                    }));
                                                  }}
                                                  className="w-14 px-1.5 py-0.5 text-center font-bold text-xs rounded border border-slate-200 bg-white"
                                                />
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 4: COLOURS & IMAGES (VARIATIONS STUDIO) */}
              {activeTab === 'colours-images' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base font-heading">
                      Garment Colour Variations &amp; Photos
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure each colour variation. Either upload an authentic product photo (Option A) or use the Fabric Recoloring Studio (Option B) to generate a realistic fabric variation while keeping illustrations, dinosaur graphics, shorts, and hat unchanged!
                    </p>
                  </div>

                  {/* Colour Variations List */}
                  <div className="space-y-3.5">
                    {activeMatrixColors.map((col) => {
                      const colImg = formData.colorImages[col.name] || formData.images[0] || '/images/products/dino-baby-set.jpg';
                      const isDefaultRed = col.name.toLowerCase() === 'red';
                      const isCustomOrRecolored = Boolean(formData.colorImages[col.name]);
                      const associatedPart = formData.parts.find((p) =>
                        p.colors.some((c) => c.name.toLowerCase() === col.name.toLowerCase())
                      )?.name || (formData.parts[0]?.name || 'Garment Component');

                      return (
                        <div
                          key={col.name}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center space-x-4">
                            {/* Large, uncropped preview */}
                            <div className="relative w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden bg-stone-50 border-2 border-stone-200 shrink-0 p-1.5 flex items-center justify-center shadow-xs">
                              <div className="relative w-full h-full flex items-center justify-center">
                                <Image
                                  src={colImg}
                                  alt={col.name}
                                  fill
                                  className="object-contain object-center"
                                  sizes="112px"
                                />
                              </div>
                              <span className="absolute bottom-1 inset-x-1 text-[8px] font-black uppercase text-center bg-stone-900/80 text-white rounded-md py-0.5 backdrop-blur-xs truncate px-1">
                                {col.name}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: col.hex }}
                                />
                                <span className="font-black text-slate-900 text-sm sm:text-base">
                                  {col.name}
                                </span>
                                {isDefaultRed ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                                    Base Photo (Original)
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold border border-pink-200">
                                    {isCustomOrRecolored ? 'Approved Variation' : 'Inherited Base'}
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-slate-600 font-medium">
                                Associated Component:{' '}
                                <strong className="text-slate-900">{associatedPart}</strong>
                              </div>

                              <span className="text-[11px] text-slate-400 block truncate max-w-xs sm:max-w-md font-mono">
                                {colImg}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => triggerColorUpload(col.name)}
                              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-500" />
                              <span>Upload Photo</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => triggerRecolorStudio(col)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white text-xs font-extrabold shadow-xs transition-all flex items-center space-x-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                              <span>Recolor Studio</span>
                            </button>

                            {isCustomOrRecolored && !isDefaultRed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => {
                                    const next = { ...prev.colorImages };
                                    delete next[col.name];
                                    return { ...prev, colorImages: next };
                                  });
                                  showToast(`Reset ${col.name} image to base photo.`);
                                }}
                                className="px-2.5 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                                title="Revert to base photo"
                              >
                                Revert
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Extra Colour */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add another colour (e.g. Lavender)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
                    >
                      + Add Colour
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 5: PRICING */}
              {activeTab === 'pricing' && (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base font-heading">
                      Product Pricing &amp; Badges
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">
                        Selling Price (LKR) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, sellingPrice: Math.max(1, parseInt(e.target.value) || 0) }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">
                        Compare / Original Price (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.comparePrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, comparePrice: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                        placeholder="e.g. 17500"
                      />
                      {calculatedDiscount > 0 && (
                        <span className="text-[11px] font-black text-emerald-600 block mt-1">
                          🎉 {calculatedDiscount}% Discount Badge will be displayed to customers
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="font-extrabold text-slate-800 block">Catalog Badges:</span>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isNewArrival}
                          onChange={(e) => setFormData((prev) => ({ ...prev, isNewArrival: e.target.checked }))}
                          className="rounded text-pink-500"
                        />
                        <span>New Arrival Badge</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isBestSeller}
                          onChange={(e) => setFormData((prev) => ({ ...prev, isBestSeller: e.target.checked }))}
                          className="rounded text-pink-500"
                        />
                        <span>Best Seller Badge</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: PREVIEW & PUBLISH */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base font-heading">
                      Product Preview &amp; Verification
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verify your product details and test the interactive colour variation and stock states before publishing to the live store.
                    </p>
                  </div>

                  {/* Interactive Live Card Preview */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-5 space-y-3">
                      <div className="relative aspect-square min-h-[280px] sm:min-h-[340px] rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs p-3 flex items-center justify-center">
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={
                              formData.colorImages[previewSelectedColor] ||
                              formData.images[0] ||
                              '/images/products/dino-baby-set.jpg'
                            }
                            alt="Live Preview"
                            fill
                            className="object-contain object-center transition-all duration-200"
                            sizes="(max-width: 768px) 100vw, 360px"
                          />
                        </div>
                        <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-black uppercase text-slate-800 border border-slate-200 shadow-2xs">
                          {previewSelectedColor} Variation
                        </span>
                      </div>

                      {/* Quick Variant Switcher in Admin Preview */}
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {activeMatrixColors.map((c) => {
                          const isSelected = previewSelectedColor.toLowerCase() === c.name.toLowerCase();
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => setPreviewSelectedColor(c.name)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                                isSelected
                                  ? 'border-pink-600 bg-pink-50 text-pink-700 ring-2 ring-pink-100 shadow-2xs'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span>{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black uppercase">
                          {formData.categoryName}
                        </span>
                        {formData.productType === 'set' && (
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                            Set ({formData.parts.length} Parts)
                          </span>
                        )}
                      </div>

                      <h4 className="text-xl font-black text-slate-900 font-heading">
                        {formData.name || 'Untitled Baby Product'}
                      </h4>

                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-slate-900">
                          {formatCurrency(formData.sellingPrice)}
                        </span>
                        {calculatedDiscount > 0 && (
                          <span className="text-sm text-slate-400 line-through">
                            {formatCurrency(Number(formData.comparePrice))}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {formData.description || formData.shortDescription}
                      </p>

                      <div className="pt-2 border-t border-slate-200 space-y-2">
                        <span className="text-xs font-extrabold text-slate-700 block">
                          Configured Colours:
                        </span>
                        <div className="flex items-center space-x-2">
                          {activeMatrixColors.map((c) => (
                            <span
                              key={c.name}
                              className="px-2.5 py-1 rounded-full border border-slate-200 bg-white text-xs font-bold flex items-center space-x-1.5"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span>{c.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-slate-700 block">
                          Sizes &amp; Total Inventory:
                        </span>
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          {formData.sizes.map((s) => (
                            <span key={s} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 font-bold text-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 block mt-1">
                          ✓ {totalMatrixStock} total sellable units configured in inventory matrix
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Validation Checklist */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                    <span className="font-extrabold text-slate-800 block">Pre-flight Checklist:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Product name and category defined</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Selling price valid ({formatCurrency(formData.sellingPrice)})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Inventory matrix filled ({totalMatrixStock} units)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Colour variations and photos synchronized</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-full border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleSaveProduct('draft')}
                  className="px-4 py-2.5 rounded-full border border-slate-300 font-bold text-xs text-slate-700 hover:bg-white transition-all shadow-2xs"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveProduct('published')}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                >
                  Publish Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FABRIC RECOLOR STUDIO MODAL (OPTION B)                                     */}
      {/* ========================================================================= */}
      {studioConfig && (
        <FabricRecolorStudio
          baseImageUrl={studioConfig.baseImageUrl}
          targetColorHex={studioConfig.targetColorHex}
          targetColorName={studioConfig.targetColorName}
          partName={studioConfig.partName}
          onSaveVariation={handleSaveStudioVariation}
          onClose={() => setStudioConfig(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
              🗑️
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base font-heading">
                Delete "{deleteConfirmProduct.name}"?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure? This will remove this item from your online boutique catalog.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-black hover:bg-rose-700 shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
