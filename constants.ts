
import type { Category, Product } from './types';

export const EMOJI_OPTIONS = ['🥤', '💊', '📦', '🍞', '🥛', '🧼', '💻', '📱', '🍬', '🍦'];

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Boissons Gazeuses', icon: '🥤' },
  { id: '2', name: 'Produits Pharmaceutiques', icon: '💊' },
  { id: '3', name: 'Articles Divers', icon: '📦' },
  { id: '4', name: 'Alimentation', icon: '🍞' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Coca-Cola 500ml', categoryId: '1', stock: 50, salePrice: 75, purchasePrice: 50, totalSales: 120 },
  { id: 'p2', name: 'Paracétamol 500mg', categoryId: '2', stock: 100, salePrice: 15, purchasePrice: 8, totalSales: 250 },
  { id: 'p3', name: 'Piles AA (paquet de 4)', categoryId: '3', stock: 8, salePrice: 150, purchasePrice: 100, totalSales: 40 },
  { id: 'p4', name: 'Pain de mie', categoryId: '4', stock: 20, salePrice: 120, purchasePrice: 90, totalSales: 85 },
  { id: 'p5', name: 'Sprite 1L', categoryId: '1', stock: 0, salePrice: 125, purchasePrice: 95, totalSales: 60 },
  { id: 'p6', name: 'Sirop pour la toux', categoryId: '2', stock: 15, salePrice: 250, purchasePrice: 180, totalSales: 30 },
];
