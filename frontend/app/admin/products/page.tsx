'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { useAdminData } from '../../../hooks/AdminContext';
import { Product, ProductColorOption } from '../../../types/product';
import { uploadService } from '../../../services/uploadService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { ProductCard } from '../../../components/products/ProductCard';

// Predefined baby categories
const DEFAULT_CATEGORIES = [
  { name: 'Baby Clothing', slug: 'baby-clothing' },
  { name: 'Baby Girls', slug: 'girls' },
  { name: 'Baby Boys', slug: 'boys' },
  { name: 'Newborn', slug: 'newborn' },
  { name: 'Nursery & Toys', slug: 'nursery-toys' },
  { name: 'Bedding & Swaddles', slug: 'bedding-swaddles' },
  { name: 'Baby Gear & Travel', slug: 'gear-travel' },
  { name: 'Special Occasions', slug: 'special-occasions' },
  { name: 'Gifting', slug: 'gifting' },
];

const PRESET_COLOURS: ProductColorOption[] = [
  { name: 'Baby Pink', hex: '#F9A8D4' },
  { name: 'Ivory Cream', hex: '#FEF3C7' },
  { name: 'Mint Green', hex: '#A7F3D0' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Sky Blue', hex: '#BAE6FD' },
  { name: 'Warm Sand', hex: '#D4B895' },
  { name: 'Dusty Rose', hex: '#E8C5C8' },
  { name: 'Sage Green', hex: '#9BA88D' },
  { name: 'Onyx Black', hex: '#1A1A1A' },
  { name: 'Powder Blue', hex: '#B9E3F7' },
];

const PRESET_SIZES = [
  'Newborn',
  '0–3 Months',
  '3–6 Months',
  '6–12 Months',
  '12–18 Months',
  '18–24 Months',
  '2T',
  '3T',
  '4T',
  'One Size',
];

const GENDERS = ['Baby', 'Girls', 'Boys', 'Unisex'] as const;

const AGE_GROUPS = [
  'Newborn',
  '0–3 months',
  '3–6 months',
  '6–12 months',
  '1–2 years',
  '2–3 years',
  '3–4 years',
  '4–6 years',
  'All Ages',
];

type WizardTab =
  | 'basic'
  | 'images'
  | 'pricing'
  | 'colours-sizes'
  | 'inventory'
  | 'badges'
  | 'specs-seo'
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
    navigationConfig,
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
  const [activeTab, setActiveTab] = useState<WizardTab>('basic');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick Action Modals
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [previewProductData, setPreviewProductData] = useState<Product | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

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

  // Custom Color inputs in form
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#F472B6');

  // Custom Size input in form
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Feature tag input
  const [featureInput, setFeatureInput] = useState('');

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    // 1. Basic Info
    name: '',
    slug: '',
    isAutoSlug: true,
    sku: '',
    shortDescription: '',
    description: '',
    categoryName: 'Baby Clothing',
    categorySlug: 'baby-clothing',
    subcategoryName: '',
    brand: 'REXBEBE Atelier',
    gender: 'Baby' as 'Baby' | 'Girls' | 'Boys' | 'Unisex',
    ageGroup: '0–3 months',
    status: 'published' as 'published' | 'draft' | 'unpublished',

    // 2. Images
    images: ['/images/products/organic-onesie.jpg'] as string[],

    // 3. Pricing
    regularPrice: 18500,
    salePrice: '' as string | number,
    saleStartDate: '',
    saleEndDate: '',

    // 4. Colours & Sizes
    colors: [
      { name: 'Baby Pink', hex: '#F9A8D4' },
      { name: 'Ivory Cream', hex: '#FEF3C7' },
    ] as ProductColorOption[],
    sizes: ['0–3 Months', '3–6 Months'] as string[],

    // 5. Inventory
    stockQuantity: 25,
    lowStockThreshold: 5,
    stockStatus: 'in_stock' as 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order',

    // 6. Badges
    isNewArrival: true,
    isBestSeller: false,
    isSaleBadge: true,
    isFeatured: true,

    // 7. Specs & SEO
    fabricMaterial: '100% GOTS Certified Organic Mongolian Cashmere',
    careInstructions: 'Hand wash cold with baby detergent. Lay flat to dry.',
    countryOfOrigin: 'Sri Lanka & Mongolia',
    weight: '165g',
    features: [
      'GOTS Certified organic natural fibers',
      'Mother-of-pearl buttons',
      'Envelope neckline for gentle dressing',
    ] as string[],
    seoTitle: '',
    seoDescription: '',
    imageAltText: '',
  });

  // Calculate dynamic discount percentage
  const calculatedDiscount = useMemo(() => {
    const reg = Number(formData.regularPrice) || 0;
    const sale = Number(formData.salePrice);
    if (!sale || sale <= 0 || sale >= reg || reg <= 0) return 0;
    return Math.round((1 - sale / reg) * 100);
  }, [formData.regularPrice, formData.salePrice]);

  // Merge categories from navigationConfig and presets
  const availableCategories = useMemo(() => {
    const map = new Map<string, string>();
    DEFAULT_CATEGORIES.forEach((c) => map.set(c.slug, c.name));
    (navigationConfig?.items || []).forEach((item) => {
      if (item.name && item.slug) map.set(item.slug, item.name);
      (item.subGroups || []).forEach((grp) => {
        if (grp.title && grp.slug) map.set(grp.slug, grp.title);
      });
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [navigationConfig]);

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
        p.category?.slug === selectedCategory ||
        p.category?.name === selectedCategory;

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

    // Sort
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

  // Open Add Product Wizard
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      isAutoSlug: true,
      sku: `REX-${Math.floor(Math.random() * 9000 + 1000)}`,
      shortDescription: '',
      description: '',
      categoryName: 'Baby Clothing',
      categorySlug: 'baby-clothing',
      subcategoryName: '',
      brand: 'REXBEBE Atelier',
      gender: 'Baby',
      ageGroup: '0–3 months',
      status: 'published',
      images: ['/images/products/organic-onesie.jpg'],
      regularPrice: 18500,
      salePrice: '',
      saleStartDate: '',
      saleEndDate: '',
      colors: [
        { name: 'Baby Pink', hex: '#F9A8D4' },
        { name: 'Ivory Cream', hex: '#FEF3C7' },
      ],
      sizes: ['Newborn', '0–3 Months', '3–6 Months'],
      stockQuantity: 25,
      lowStockThreshold: 5,
      stockStatus: 'in_stock',
      isNewArrival: true,
      isBestSeller: false,
      isSaleBadge: true,
      isFeatured: true,
      fabricMaterial: '100% GOTS Certified Organic Mongolian Cashmere',
      careInstructions: 'Hand wash cold with baby detergent. Lay flat to dry.',
      countryOfOrigin: 'Sri Lanka & Mongolia',
      weight: '165g',
      features: [
        'GOTS Certified organic natural fibers',
        'Mother-of-pearl buttons',
        'Envelope neckline for gentle dressing',
      ],
      seoTitle: '',
      seoDescription: '',
      imageAltText: '',
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

    const totalStock =
      p.stockQuantity ?? (p.variants || []).reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 20;

    // Has discount?
    const hasSale = Boolean(p.comparePrice && p.comparePrice > p.price);
    const regPrice = hasSale ? p.comparePrice! : p.price;
    const salePrice = hasSale ? p.price : '';

    setFormData({
      name: p.name,
      slug: p.slug,
      isAutoSlug: false,
      sku: p.sku || `REX-${p.slug.substring(0, 4).toUpperCase()}`,
      shortDescription: p.shortDescription || p.description?.slice(0, 100) || '',
      description: p.description || '',
      categoryName: p.category?.name || 'Baby Clothing',
      categorySlug: p.category?.slug || 'baby-clothing',
      subcategoryName: p.subcategory?.name || '',
      brand: p.brand || 'REXBEBE Atelier',
      gender: (p.gender as any) || 'Baby',
      ageGroup: p.ageGroup || '0–3 months',
      status: p.status || 'published',
      images: existingImages,
      regularPrice: regPrice,
      salePrice: salePrice,
      saleStartDate: p.saleStartDate || '',
      saleEndDate: p.saleEndDate || '',
      colors: colors.length > 0 ? colors : [{ name: 'Baby Pink', hex: '#F9A8D4' }],
      sizes: sizes.length > 0 ? sizes : ['0–3 Months', '3–6 Months'],
      stockQuantity: totalStock,
      lowStockThreshold: p.lowStockThreshold || 5,
      stockStatus: p.stockStatus || (totalStock <= 0 ? 'out_of_stock' : totalStock <= 5 ? 'low_stock' : 'in_stock'),
      isNewArrival: Boolean(p.isNewArrival),
      isBestSeller: Boolean(p.isBestSeller),
      isSaleBadge: Boolean(p.isSaleBadge ?? hasSale),
      isFeatured: Boolean(p.isFeatured),
      fabricMaterial: p.fabricMaterial || '100% GOTS Certified Organic Cotton',
      careInstructions: p.careInstructions || 'Gentle machine wash with cold water. Line dry in shade.',
      countryOfOrigin: p.countryOfOrigin || 'Sri Lanka',
      weight: p.weight || '160g',
      features: p.features || ['Ultra-soft organic fabric', 'Nickel-free buttons'],
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      imageAltText: p.images?.[0]?.alt || p.name,
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
        // Replacing a specific image
        const targetIdx = replaceIndexRef.current;
        setFormData((prev) => {
          const nextImages = [...prev.images];
          nextImages[targetIdx] = uploadedUrls[0];
          return { ...prev, images: nextImages };
        });
        replaceIndexRef.current = null;
        showToast('Image replaced successfully! 🌸');
      } else {
        // Appending new images
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

  const handleSetMainImage = (index: number) => {
    setFormData((prev) => {
      const selected = prev.images[index];
      const others = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: [selected, ...others] };
    });
    showToast('Main product image updated ⭐');
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const targetIdx = direction === 'left' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newImages.length) return prev;
      const temp = newImages[index];
      newImages[index] = newImages[targetIdx];
      newImages[targetIdx] = temp;
      return { ...prev, images: newImages };
    });
  };

  const handleRemoveImage = (index: number) => {
    if (formData.images.length <= 1) {
      showToast('A product needs at least one photo.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    showToast('Photo removed.');
  };

  const handleTriggerReplaceImage = (index: number) => {
    replaceIndexRef.current = index;
    fileInputRef.current?.click();
  };

  // Color Management
  const handleTogglePresetColor = (preset: ProductColorOption) => {
    setFormData((prev) => {
      const exists = prev.colors.some((c) => c.name.toLowerCase() === preset.name.toLowerCase());
      if (exists) {
        if (prev.colors.length <= 1) {
          showToast('Please keep at least one colour.');
          return prev;
        }
        return {
          ...prev,
          colors: prev.colors.filter((c) => c.name.toLowerCase() !== preset.name.toLowerCase()),
        };
      } else {
        return { ...prev, colors: [...prev.colors, preset] };
      }
    });
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) {
      showToast('Please enter a colour name (e.g. Lavender Mist).');
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

  const handleRemoveColor = (name: string) => {
    if (formData.colors.length <= 1) {
      showToast('Please keep at least one colour.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.name !== name),
    }));
  };

  // Size Management
  const handleToggleSize = (sizeStr: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(sizeStr);
      if (exists) {
        if (prev.sizes.length <= 1) {
          showToast('Please keep at least one size.');
          return prev;
        }
        return { ...prev, sizes: prev.sizes.filter((s) => s !== sizeStr) };
      } else {
        return { ...prev, sizes: [...prev.sizes, sizeStr] };
      }
    });
  };

  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const clean = customSizeInput.trim();
    if (!formData.sizes.includes(clean)) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, clean] }));
      showToast(`Size "${clean}" added! 📏`);
    }
    setCustomSizeInput('');
  };

  // Features Management
  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, featureInput.trim()],
    }));
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  // Save / Publish Product
  const handleSaveProduct = async (saveStatus: 'published' | 'draft') => {
    // Basic validation
    if (!formData.name.trim()) {
      showToast('Please enter a product name first.');
      setActiveTab('basic');
      return;
    }

    const reg = Number(formData.regularPrice);
    if (!reg || reg <= 0) {
      showToast('Please enter a valid regular price greater than 0.');
      setActiveTab('pricing');
      return;
    }

    const sale = formData.salePrice !== '' ? Number(formData.salePrice) : null;
    if (sale !== null && sale >= reg) {
      showToast('Sale price must be lower than the regular price.');
      setActiveTab('pricing');
      return;
    }

    // Prepare slug
    const cleanSlug =
      formData.slug.trim() ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Current price vs comparePrice
    const finalPrice = sale !== null && sale > 0 ? sale : reg;
    const finalComparePrice = sale !== null && sale > 0 ? reg : undefined;

    // Build Images
    const productImages = formData.images.map((url, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url,
      alt: formData.imageAltText.trim() || formData.name,
      position: idx + 1,
    }));

    // Build Variants from Sizes and Colors
    const productVariants = formData.sizes.map((sz, idx) => ({
      id: `var-${Date.now()}-${idx}`,
      sku: `${formData.sku || cleanSlug.toUpperCase()}-${sz.replace(/[^A-Z0-9]/gi, '')}`,
      size: sz,
      color: formData.colors[0]?.name || 'Natural',
      colorHex: formData.colors[0]?.hex || '#E6DFD5',
      price: finalPrice,
      stockQuantity: Math.max(1, Math.round(Number(formData.stockQuantity) / formData.sizes.length)),
    }));

    const finalProductData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formData.name.trim(),
      slug: cleanSlug,
      sku: formData.sku.trim() || `REX-${cleanSlug.substring(0, 4).toUpperCase()}`,
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim() || formData.shortDescription.trim(),
      price: finalPrice,
      comparePrice: finalComparePrice,
      discountPercentage: calculatedDiscount > 0 ? calculatedDiscount : undefined,
      saleStartDate: formData.saleStartDate || undefined,
      saleEndDate: formData.saleEndDate || undefined,
      isFeatured: formData.isFeatured,
      isNewArrival: formData.isNewArrival,
      isBestSeller: formData.isBestSeller,
      isSaleBadge: formData.isSaleBadge && calculatedDiscount > 0,
      status: saveStatus,
      brand: formData.brand.trim() || 'REXBEBE Atelier',
      gender: formData.gender,
      ageGroup: formData.ageGroup,
      category: {
        id: editingProduct?.category?.id || `cat-${Date.now()}`,
        name: formData.categoryName,
        slug: formData.categorySlug,
      },
      subcategory: formData.subcategoryName
        ? {
            id: `sub-${Date.now()}`,
            name: formData.subcategoryName,
            slug: formData.subcategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          }
        : undefined,
      images: productImages,
      variants: productVariants,
      colors: formData.colors,
      sizes: formData.sizes,
      stockQuantity: Number(formData.stockQuantity) || 20,
      lowStockThreshold: Number(formData.lowStockThreshold) || 5,
      stockStatus: formData.stockStatus,
      fabricMaterial: formData.fabricMaterial.trim(),
      careInstructions: formData.careInstructions.trim(),
      countryOfOrigin: formData.countryOfOrigin.trim(),
      weight: formData.weight.trim(),
      features: formData.features,
      rating: editingProduct?.rating || 5.0,
      reviewCount: editingProduct?.reviewCount || 1,
      reviewsList: editingProduct?.reviewsList || [],
      seoTitle: formData.seoTitle.trim() || `${formData.name} | REXBEBE Baby Clothing`,
      seoDescription:
        formData.seoDescription.trim() ||
        formData.shortDescription.trim() ||
        formData.description.trim().slice(0, 150),
    };

    try {
      if (editingProduct) {
        await updateProduct(finalProductData);
        showToast('Changes saved successfully.');
      } else {
        await addProduct(finalProductData);
        showToast('Changes saved successfully.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(
        err.message ||
          "We couldn't save your changes. Your existing information has not been intentionally removed. Please try again."
      );
    }
  };

  // Duplicate Product Action
  const handleDuplicate = async (p: Product) => {
    try {
      const duplicated = await duplicateProduct(p.id);
      showToast(`Duplicated "${p.name}" as draft! 📄✨`);
    } catch (err: any) {
      showToast('Could not duplicate product.');
    }
  };

  // Delete Product Action (Permanent Deletion)
  const handleConfirmDelete = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await deleteProduct(deleteConfirmProduct.id);
      showToast('The item has been permanently deleted.');
      setDeleteConfirmProduct(null);
    } catch (err: any) {
      showToast(
        err.message ||
          "We couldn't save your changes. Your existing information has not been intentionally removed. Please try again."
      );
    }
  };

  // Preview Product Model Object for Live Preview Card
  const livePreviewProduct: Product = useMemo(() => {
    const reg = Number(formData.regularPrice) || 18500;
    const sale = formData.salePrice !== '' ? Number(formData.salePrice) : null;
    const finalPrice = sale !== null && sale > 0 ? sale : reg;
    const finalCompare = sale !== null && sale > 0 ? reg : undefined;

    return {
      id: editingProduct?.id || 'preview-prod',
      name: formData.name || 'Aurelia Organic Baby Dress',
      slug: formData.slug || 'aurelia-organic-baby-dress',
      sku: formData.sku || 'REX-PREVIEW',
      description: formData.description || 'Gentle organic clothing for tender baby moments.',
      price: finalPrice,
      comparePrice: finalCompare,
      isFeatured: formData.isFeatured,
      isNewArrival: formData.isNewArrival,
      isBestSeller: formData.isBestSeller,
      isSaleBadge: formData.isSaleBadge && calculatedDiscount > 0,
      category: {
        id: 'cat-preview',
        name: formData.categoryName || 'Baby Clothing',
        slug: formData.categorySlug || 'baby-clothing',
      },
      images: formData.images.map((url, i) => ({
        id: `img-preview-${i}`,
        url,
        alt: formData.name,
        position: i + 1,
      })),
      variants: formData.colors.map((c, i) => ({
        id: `var-preview-${i}`,
        sku: `SKU-${c.name}`,
        size: formData.sizes[0] || 'Standard',
        color: c.name,
        colorHex: c.hex,
        price: finalPrice,
        stockQuantity: 25,
      })),
      colors: formData.colors,
      sizes: formData.sizes,
      rating: editingProduct?.rating || 4.9,
      reviewCount: editingProduct?.reviewCount || 42,
    };
  }, [formData, editingProduct, calculatedDiscount]);

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleUploadFiles}
      />

      {/* Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Product Management"
          subtitle="Add, edit, duplicate, and manage all your baby clothing boutique products with ease."
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center text-xl shrink-0">
                👗
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Total Items
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  {products.length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                ✨
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Live Published
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  {products.filter((p) => p.status !== 'draft' && p.status !== 'unpublished').length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
                🌿
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Best Sellers
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  {products.filter((p) => p.isBestSeller).length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
                🍑
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                  Sale Products
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  {products.filter((p) => p.comparePrice && p.comparePrice > p.price).length}
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar & Search / Filters */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU or category..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={handleOpenAddModal}
                  className="btn-rexbebe-3d btn-3d-pink px-5 py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Filter Pills Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-400 flex items-center mr-1">
                <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Filter:
              </span>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold outline-none"
              >
                <option value="ALL">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                value={selectedStockFilter}
                onChange={(e) => {
                  setSelectedStockFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold outline-none"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock (≤ 5)</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="unpublished">Unpublished</option>
              </select>

              {/* Sort By */}
              <div className="ml-auto flex items-center space-x-2">
                <span className="font-bold text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold outline-none"
                >
                  <option value="name">Name (A–Z)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="stock">Stock (High to Low)</option>
                  <option value="rating">Rating (Highest)</option>
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
                  No boutique items match your current search or filter criteria. Try resetting your filters.
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
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Pricing</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4">Badges</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedProducts.map((p) => {
                      const mainImg = p.images?.[0]?.url || '/images/products/organic-onesie.jpg';
                      const isSale = Boolean(p.comparePrice && p.comparePrice > p.price);
                      const stockCount =
                        p.stockQuantity ??
                        p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ??
                        0;
                      const isLow = stockCount > 0 && stockCount <= (p.lowStockThreshold || 5);
                      const isOut = stockCount <= 0;
                      const isPublished = (p.status || 'published') === 'published';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Image & Name */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                                <Image
                                  src={mainImg}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
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

                          {/* SKU */}
                          <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-slate-600">
                            {p.sku || p.variants?.[0]?.sku || 'N/A'}
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-100 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
                              {p.category?.name || 'Unassigned'}
                            </span>
                          </td>

                          {/* Pricing */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-slate-900 block">
                                {formatCurrency(p.price)}
                              </span>
                              {isSale && (
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] text-slate-400 line-through">
                                    {formatCurrency(p.comparePrice!)}
                                  </span>
                                  <span className="text-[9px] font-extrabold text-pink-600 bg-pink-50 px-1.5 py-0.2 rounded">
                                    -{p.discountPercentage || Math.round((1 - p.price / p.comparePrice!) * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                              />
                              <span className="font-extrabold text-slate-800 text-xs">
                                {stockCount}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isOut ? '(Out)' : isLow ? '(Low)' : 'units'}
                              </span>
                            </div>
                          </td>

                          {/* Badges */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {p.isNewArrival && (
                                <span className="text-[9px] font-extrabold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full">
                                  NEW
                                </span>
                              )}
                              {p.isBestSeller && (
                                <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                                  BEST
                                </span>
                              )}
                              {isSale && (
                                <span className="text-[9px] font-extrabold bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full">
                                  SALE
                                </span>
                              )}
                              {!p.isNewArrival && !p.isBestSeller && !isSale && (
                                <span className="text-[10px] text-slate-300">—</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus = isPublished ? 'draft' : 'published';
                                updateProductStatus(p.id, nextStatus);
                                showToast(`Product set to ${nextStatus}`);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
                                isPublished
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                              title="Click to toggle publish status"
                            >
                              {isPublished ? '● Published' : '○ Draft'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-600 hover:text-pink-600 flex items-center justify-center transition-colors"
                                title="Edit Product Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Preview Button */}
                              <button
                                onClick={() => setPreviewProductData(p)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-600 flex items-center justify-center transition-colors"
                                title="Preview Customer Card"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate Button */}
                              <button
                                onClick={() => handleDuplicate(p)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 flex items-center justify-center transition-colors"
                                title="Duplicate as New Draft"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => setDeleteConfirmProduct(p)}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors"
                                title="Delete Product"
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

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL WIZARD (8 CLEAR NON-TECHNICAL TABS)              */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-white/80 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-50/60 via-purple-50/40 to-sky-50/50">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-600 block">
                  {editingProduct ? 'Edit Existing Product' : 'Add New Product'}
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

            {/* Navigation Tabs Bar */}
            <div className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-100 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'basic', label: '1. Basic Info', icon: Tag },
                { id: 'images', label: '2. Images', icon: ImageIcon },
                { id: 'pricing', label: '3. Pricing', icon: DollarSign },
                { id: 'colours-sizes', label: '4. Colours & Sizes', icon: Palette },
                { id: 'inventory', label: '5. Inventory', icon: Boxes },
                { id: 'badges', label: '6. Badges', icon: Award },
                { id: 'specs-seo', label: '7. Specs & SEO', icon: Globe },
                { id: 'preview', label: '8. Preview', icon: Eye },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as WizardTab)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-extrabold whitespace-nowrap transition-all ${
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

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aurelia Organic Baby Dress"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name,
                          slug: prev.isAutoSlug
                            ? name
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '')
                            : prev.slug,
                        }));
                      }}
                      className="w-full p-3 rounded-2xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-pink-300 outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Enter the name customers will see on your website.
                    </p>
                  </div>

                  {/* Slug & SKU */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-extrabold text-slate-800">Product Slug</label>
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, isAutoSlug: !p.isAutoSlug }))}
                          className="text-[10px] text-pink-600 font-bold hover:underline"
                        >
                          {formData.isAutoSlug ? 'Customise' : 'Auto Generate'}
                        </button>
                      </div>
                      <input
                        type="text"
                        disabled={formData.isAutoSlug}
                        value={formData.slug}
                        onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                        className={`w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono ${
                          formData.isAutoSlug ? 'bg-slate-50 text-slate-500' : 'bg-white'
                        }`}
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Web address URL link for this product.
                      </p>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">Product SKU</label>
                      <input
                        type="text"
                        placeholder="e.g. REX-AUREL-001"
                        value={formData.sku}
                        onChange={(e) => setFormData((p) => ({ ...p, sku: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Unique inventory tracking identification code.
                      </p>
                    </div>
                  </div>

                  {/* Category & Subcategory */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">Category</label>
                      <select
                        value={formData.categorySlug}
                        onChange={(e) => {
                          const cat = availableCategories.find((c) => c.slug === e.target.value);
                          setFormData((p) => ({
                            ...p,
                            categorySlug: e.target.value,
                            categoryName: cat?.name || e.target.value,
                          }));
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold outline-none"
                      >
                        {availableCategories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">
                        Subcategory <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rompers, Dresses, Sleepwear"
                        value={formData.subcategoryName}
                        onChange={(e) => setFormData((p) => ({ ...p, subcategoryName: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  {/* Brand & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">Brand</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData((p) => ({ ...p, brand: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">Gender</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {GENDERS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, gender: g }))}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              formData.gender === g
                                ? 'bg-pink-500 text-white border-pink-500'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Age Group */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1.5">Age Group</label>
                    <div className="flex flex-wrap gap-1.5">
                      {AGE_GROUPS.map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, ageGroup: age }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                            formData.ageGroup === age
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief 1-2 sentence highlight shown on product cards..."
                      value={formData.shortDescription}
                      onChange={(e) => setFormData((p) => ({ ...p, shortDescription: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 outline-none"
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">Full Description</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the product, material, features, softness and other useful details..."
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGES */}
              {activeTab === 'images' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-start space-x-3 text-xs text-sky-900">
                    <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold">Photo Guidelines &amp; Main Product Photo:</p>
                      <p className="text-sky-800 mt-0.5 leading-relaxed">
                        Upload clear photos of your product. The first photo with the crown badge is displayed on the public product card. Additional photos form a gallery on the product details page.
                      </p>
                    </div>
                  </div>

                  {/* Upload Drop Zone / Button */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-3xl p-6 sm:p-8 text-center cursor-pointer bg-pink-50/20 hover:bg-pink-50/40 transition-colors space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-black text-slate-900 text-sm">
                      {isUploading ? 'Uploading photos...' : 'Click to Upload Images or Drag & Drop'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports JPG, PNG, WebP (up to 8MB each). Photos are stored persistently.
                    </p>
                  </div>

                  {/* Images List */}
                  <div>
                    <span className="text-xs font-black text-slate-800 block mb-2">
                      Product Photos ({formData.images.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {formData.images.map((url, idx) => {
                        const isMain = idx === 0;
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-2xl overflow-hidden border-2 transition-all group bg-slate-100 flex flex-col justify-between ${
                              isMain
                                ? 'border-pink-500 ring-2 ring-pink-200'
                                : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <div className="relative aspect-square w-full">
                              <Image
                                src={url}
                                alt={`Product photo ${idx + 1}`}
                                fill
                                className="object-cover"
                              />

                              {/* Main Photo Badge */}
                              {isMain && (
                                <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center space-x-1 z-10">
                                  <span>👑 Main Photo</span>
                                </span>
                              )}
                            </div>

                            {/* Image Controls Bar */}
                            <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveImage(idx, 'left')}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 flex items-center justify-center font-bold"
                                  title="Move Left"
                                >
                                  ◀
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === formData.images.length - 1}
                                  onClick={() => handleMoveImage(idx, 'right')}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 flex items-center justify-center font-bold"
                                  title="Move Right"
                                >
                                  ▶
                                </button>
                              </div>

                              <div className="flex items-center space-x-1">
                                {!isMain && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMainImage(idx)}
                                    className="px-2 py-0.5 rounded bg-pink-50 text-pink-700 hover:bg-pink-100 font-extrabold text-[10px]"
                                    title="Set as Main Photo"
                                  >
                                    Set Main
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleTriggerReplaceImage(idx)}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px]"
                                  title="Replace"
                                >
                                  Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="w-6 h-6 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING */}
              {activeTab === 'pricing' && (
                <div className="space-y-5 max-w-xl">
                  {/* Regular Price */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      Regular Price (LKR) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">
                        LKR
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="22000"
                        value={formData.regularPrice}
                        onChange={(e) => setFormData((p) => ({ ...p, regularPrice: Math.max(0, Number(e.target.value)) }))}
                        className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-black text-sm outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Enter the normal selling price in Sri Lankan rupees.
                    </p>
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      Sale Price (LKR) <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">
                        LKR
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Leave empty if not on sale (e.g. 18500)"
                        value={formData.salePrice}
                        onChange={(e) => setFormData((p) => ({ ...p, salePrice: e.target.value }))}
                        className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-black text-sm outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Enter discounted price. Leave this empty if the product is not on sale.
                    </p>
                  </div>

                  {/* Calculated Discount Card */}
                  {calculatedDiscount > 0 ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                          Active Discount Applied
                        </span>
                        <span className="text-slate-700">
                          Customers will save{' '}
                          <strong className="text-emerald-800">
                            {formatCurrency(Number(formData.regularPrice) - Number(formData.salePrice))}
                          </strong>{' '}
                          off regular price!
                        </span>
                      </div>
                      <span className="px-3 py-1.5 rounded-full bg-emerald-600 text-white font-black text-sm">
                        {calculatedDiscount}% OFF
                      </span>
                    </div>
                  ) : null}

                  {/* Scheduled Sale Dates */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="font-extrabold text-slate-800 block mb-2">
                      Scheduled Sale Dates <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block mb-1">Start Date</span>
                        <input
                          type="date"
                          value={formData.saleStartDate}
                          onChange={(e) => setFormData((p) => ({ ...p, saleStartDate: e.target.value }))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block mb-1">End Date</span>
                        <input
                          type="date"
                          value={formData.saleEndDate}
                          onChange={(e) => setFormData((p) => ({ ...p, saleEndDate: e.target.value }))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: COLOURS & SIZES */}
              {activeTab === 'colours-sizes' && (
                <div className="space-y-6">
                  {/* Colours Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-extrabold text-slate-800 block">
                          Product Colours ({formData.colors.length} selected)
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Choose colours available for this item. Swatches appear on the product card.
                        </p>
                      </div>
                    </div>

                    {/* Active Selected Colours */}
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.map((c) => (
                        <span
                          key={c.name}
                          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-800"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(c.name)}
                            className="text-slate-400 hover:text-rose-500 text-sm ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Preset Baby Palette Quick Toggles */}
                    <div className="pt-2">
                      <span className="text-[11px] font-extrabold text-slate-500 block mb-1.5">
                        Quick Add Pastel Baby Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLOURS.map((preset) => {
                          const isSelected = formData.colors.some(
                            (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                          );
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => handleTogglePresetColor(preset)}
                              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                                isSelected
                                  ? 'bg-pink-100 border-pink-300 text-pink-700'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: preset.hex }}
                              />
                              <span>{preset.name}</span>
                              {isSelected && <span>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Custom Colour */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Custom Colour:</span>
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                        title="Pick color"
                      />
                      <input
                        type="text"
                        placeholder="Colour Name (e.g. Oatmeal)"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomColor}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-extrabold text-xs hover:bg-slate-900"
                      >
                        + Add Colour
                      </button>
                    </div>
                  </div>

                  {/* Sizes Section */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div>
                      <label className="font-extrabold text-slate-800 block">
                        Product Sizes ({formData.sizes.length} selected)
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Select applicable baby sizes for this product. You can also add custom sizes.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SIZES.map((sz) => {
                        const isSelected = formData.sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleSize(sz)}
                            className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                              isSelected
                                ? 'bg-pink-500 text-white border-pink-500 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {sz} {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Size Input */}
                    <div className="flex items-center space-x-2 pt-1 max-w-sm">
                      <input
                        type="text"
                        placeholder="Add custom size (e.g. 5–6 Years)"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSize}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-extrabold text-xs hover:bg-slate-900"
                      >
                        + Add Size
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: INVENTORY */}
              {activeTab === 'inventory' && (
                <div className="space-y-5 max-w-xl">
                  {/* Stock Quantity */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      Total Available Stock Quantity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData((p) => ({ ...p, stockQuantity: Math.max(0, Number(e.target.value)) }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-black text-sm outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Enter how many units are currently available in inventory.
                    </p>
                  </div>

                  {/* Low Stock Threshold */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData((p) => ({ ...p, lowStockThreshold: Math.max(1, Number(e.target.value)) }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-black text-sm outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      When stock falls to or below this number, the website shows a low-stock urgency alert.
                    </p>
                  </div>

                  {/* Stock Status */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1">Stock Status</label>
                    <select
                      value={formData.stockStatus}
                      onChange={(e) => setFormData((p) => ({ ...p, stockStatus: e.target.value as any }))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold outline-none"
                    >
                      <option value="in_stock">In Stock (Available for immediate order)</option>
                      <option value="low_stock">Low Stock (Urgency alert)</option>
                      <option value="out_of_stock">Out of Stock (Prevent purchasing)</option>
                      <option value="pre_order">Pre-Order (Available for advance reservation)</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold">Inventory Protection Rule:</p>
                      <p className="text-amber-800 mt-0.5">
                        Customers cannot purchase items with 0 stock unless pre-orders are supported. Stock updates automatically upon checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BADGES */}
              {activeTab === 'badges' && (
                <div className="space-y-5 max-w-xl">
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-1">
                    <p className="font-extrabold">Independent Product Badges:</p>
                    <p className="text-purple-800 leading-relaxed">
                      Control which cute floating badges appear on the top-left of the product card. These match the exact pastel theme in your storefront design.
                    </p>
                  </div>

                  {/* Toggle NEW Badge */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-extrabold text-xs">
                          ✨ NEW
                        </span>
                        <span className="font-extrabold text-slate-900">New Arrival Badge</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Highlights recently arrived items in new collections.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData((p) => ({ ...p, isNewArrival: e.target.checked }))}
                      className="w-5 h-5 text-pink-500 rounded accent-pink-500 cursor-pointer"
                    />
                  </div>

                  {/* Toggle BEST SELLER Badge */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                          🌿 BEST SELLER
                        </span>
                        <span className="font-extrabold text-slate-900">Best Seller Badge</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Manually designate this item as a parent favorite or best seller.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData((p) => ({ ...p, isBestSeller: e.target.checked }))}
                      className="w-5 h-5 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Toggle SALE Badge */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-xs">
                          🍑 SALE
                        </span>
                        <span className="font-extrabold text-slate-900">Sale Badge</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {calculatedDiscount > 0
                          ? `Active (${calculatedDiscount}% off regular price)`
                          : 'Requires a valid Sale Price lower than Regular Price to display'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      disabled={calculatedDiscount <= 0}
                      checked={formData.isSaleBadge && calculatedDiscount > 0}
                      onChange={(e) => setFormData((p) => ({ ...p, isSaleBadge: e.target.checked }))}
                      className="w-5 h-5 text-orange-500 rounded accent-orange-500 cursor-pointer disabled:opacity-40"
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: SPECS & SEO */}
              {activeTab === 'specs-seo' && (
                <div className="space-y-5 max-w-2xl">
                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                      Product Specifications
                    </span>

                    {/* Fabric */}
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">Fabric Material</label>
                      <input
                        type="text"
                        placeholder="e.g. 100% GOTS Certified Organic Mongolian Cashmere"
                        value={formData.fabricMaterial}
                        onChange={(e) => setFormData((p) => ({ ...p, fabricMaterial: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 outline-none"
                      />
                    </div>

                    {/* Care */}
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">Care Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Hand wash cold with baby detergent. Lay flat to dry."
                        value={formData.careInstructions}
                        onChange={(e) => setFormData((p) => ({ ...p, careInstructions: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 outline-none"
                      />
                    </div>

                    {/* Origin & Weight */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-extrabold text-slate-800 block mb-1">Country of Origin</label>
                        <input
                          type="text"
                          placeholder="e.g. Sri Lanka"
                          value={formData.countryOfOrigin}
                          onChange={(e) => setFormData((p) => ({ ...p, countryOfOrigin: e.target.value }))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-extrabold text-slate-800 block mb-1">Weight</label>
                        <input
                          type="text"
                          placeholder="e.g. 165g"
                          value={formData.weight}
                          onChange={(e) => setFormData((p) => ({ ...p, weight: e.target.value }))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 outline-none"
                        />
                      </div>
                    </div>

                    {/* Features list */}
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">Key Features / Highlights</label>
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          placeholder="Add feature (e.g. Hypoallergenic buttons)"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                          className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.features.map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs"
                          >
                            <span>{feat}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(idx)}
                              className="text-slate-400 hover:text-rose-600 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                      Search Engine Optimization (SEO)
                    </span>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">SEO Title</label>
                      <input
                        type="text"
                        placeholder={formData.name ? `${formData.name} | REXBEBE` : 'SEO Title'}
                        value={formData.seoTitle}
                        onChange={(e) => setFormData((p) => ({ ...p, seoTitle: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1">Meta Description</label>
                      <textarea
                        rows={2}
                        placeholder="Snippet shown in Google search results..."
                        value={formData.seoDescription}
                        onChange={(e) => setFormData((p) => ({ ...p, seoDescription: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: PREVIEW & PUBLISH */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-base font-heading">
                        Storefront Live Card Preview
                      </h4>
                      <p className="text-xs text-slate-400">
                        This is the exact product-card appearance customers will see on your website.
                      </p>
                    </div>

                    {/* Desktop / Mobile toggle */}
                    <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1.5 rounded-lg flex items-center space-x-1 text-xs font-bold ${
                          previewDevice === 'desktop' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Desktop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1.5 rounded-lg flex items-center space-x-1 text-xs font-bold ${
                          previewDevice === 'mobile' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>

                  {/* Centered Preview Canvas */}
                  <div className="bg-[#FBF9F5] p-6 sm:p-10 rounded-3xl border border-dashed border-slate-200 flex justify-center items-center">
                    <div
                      className={`transition-all duration-300 ${
                        previewDevice === 'mobile' ? 'w-[280px]' : 'w-[320px]'
                      }`}
                    >
                      <ProductCard product={livePreviewProduct} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-2">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs: WizardTab[] = [
                        'basic',
                        'images',
                        'pricing',
                        'colours-sizes',
                        'inventory',
                        'badges',
                        'specs-seo',
                        'preview',
                      ];
                      const idx = tabs.indexOf(activeTab);
                      if (idx > 0) setActiveTab(tabs[idx - 1]);
                    }}
                    className="px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 font-extrabold text-xs text-slate-700"
                  >
                    ◀ Back
                  </button>
                )}

                {activeTab !== 'preview' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs: WizardTab[] = [
                        'basic',
                        'images',
                        'pricing',
                        'colours-sizes',
                        'inventory',
                        'badges',
                        'specs-seo',
                        'preview',
                      ];
                      const idx = tabs.indexOf(activeTab);
                      if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                    }}
                    className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs"
                  >
                    Next Step ▶
                  </button>
                ) : null}

                {/* Save as Draft */}
                <button
                  type="button"
                  onClick={() => handleSaveProduct('draft')}
                  className="px-4 py-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs"
                >
                  Save as Draft
                </button>

                {/* Publish to Storefront */}
                <button
                  type="button"
                  onClick={() => handleSaveProduct('published')}
                  className="btn-rexbebe-3d btn-3d-pink px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md"
                >
                  {editingProduct ? 'Update & Publish' : 'Publish Product ✨'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK PREVIEW MODAL (STANDALONE)                                         */}
      {/* ========================================================================= */}
      {previewProductData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest block">
                  Card Preview
                </span>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  {previewProductData.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewProductData(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center p-4 bg-[#FBF9F5] rounded-2xl border border-slate-100">
              <div className="w-[300px]">
                <ProductCard product={previewProductData} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href={`/products/${previewProductData.slug}`}
                target="_blank"
                className="text-xs font-black text-pink-600 hover:underline flex items-center space-x-1"
              >
                <span>Open Product Details Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setPreviewProductData(null)}
                className="px-4 py-2 rounded-full bg-slate-800 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SAFE DELETE CONFIRMATION MODAL (PRESERVES HISTORICAL ORDERS)              */}
      {/* ========================================================================= */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/80 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-lg font-heading">
                Permanently Delete "{deleteConfirmProduct.name}"?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This operation permanently deletes the record from the catalog database.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-extrabold text-slate-800">Safe Deletion & Financial Integrity:</p>
              <p>
                The product will be removed from all collections, navigation shortcuts, and active catalog listings. Past customer orders and accounting snapshots remain strictly intact for tax and legal compliance.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/20"
              >
                Permanently Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOAST POPUP NOTIFICATION                                                  */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs sm:text-sm font-extrabold backdrop-blur-md animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
