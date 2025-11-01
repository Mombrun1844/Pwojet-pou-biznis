
export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  stock: number;
  salePrice: number;
  purchasePrice: number;
  totalSales: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  profit: number;
  date: string;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: string;
}

export interface AppSettings {
    notificationEmail: string;
}
