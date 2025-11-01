import React, { useState, useMemo, useCallback } from 'react';
import type { Category, Product, Sale, AppNotification, NotificationType, AppSettings } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import Categories from './components/Categories';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import AIAssistant from './components/AIAssistant';
import { Package, ShoppingCart, LayoutGrid, Bell, Settings as SettingsIcon, Menu, X } from 'lucide-react';

export const AppContext = React.createContext<{
    categories: Category[];
    products: Product[];
    sales: Sale[];
    notifications: AppNotification[];
    settings: AppSettings;
    addCategory: (category: Omit<Category, 'id'>) => void;
    deleteCategory: (id: string) => void;
    addProduct: (product: Omit<Product, 'id' | 'totalSales'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    addSale: (sale: Omit<Sale, 'id' | 'date' | 'productName' | 'total' | 'profit' | 'unitPrice'>) => void;
    formatCurrency: (amount: number) => string;
    addNotification: (message: string, type: NotificationType) => void;
    updateSettings: (settings: AppSettings) => void;
}>({
    categories: [],
    products: [],
    sales: [],
    notifications: [],
    settings: { notificationEmail: '' },
    addCategory: () => {},
    deleteCategory: () => {},
    addProduct: () => {},
    updateProduct: () => {},
    deleteProduct: () => {},
    addSale: () => {},
    formatCurrency: () => '',
    addNotification: () => {},
    updateSettings: () => {},
});

type View = 'dashboard' | 'products' | 'sales' | 'categories' | 'notifications' | 'settings';

export default function App() {
    const [categories, setCategories] = useLocalStorage<Category[]>('pos-categories', INITIAL_CATEGORIES);
    const [products, setProducts] = useLocalStorage<Product[]>('pos-products', INITIAL_PRODUCTS);
    const [sales, setSales] = useLocalStorage<Sale[]>('pos-sales', []);
    const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('pos-notifications', []);
    const [settings, setSettings] = useLocalStorage<AppSettings>('pos-settings', { notificationEmail: 'admin@example.com' });

    const [activeView, setActiveView] = useState<View>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const addNotification = useCallback((message: string, type: NotificationType) => {
        const newNotification: AppNotification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);

        if (settings.notificationEmail && (type === 'error' || type === 'warning')) {
            const emailNotification: AppNotification = {
                id: (Date.now() + 1).toString(),
                message: `[Email Simulé] Envoyé à ${settings.notificationEmail}: ${message}`,
                type: 'info',
                timestamp: new Date().toISOString(),
            };
            setNotifications(prev => [emailNotification, ...prev]);
        }
    }, [setNotifications, settings.notificationEmail]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG' }).format(amount);
    };

    const addCategory = (category: Omit<Category, 'id'>) => {
        const newCategory = { ...category, id: Date.now().toString() };
        setCategories(prev => [...prev, newCategory]);
        addNotification(`Catégorie "${category.name}" ajoutée avec succès.`, 'success');
    };

    const deleteCategory = (id: string) => {
        const categoryToDelete = categories.find(c => c.id === id);
        if (products.some(p => p.categoryId === id)) {
            addNotification(`Impossible de supprimer la catégorie "${categoryToDelete?.name}". Elle contient des produits.`, 'error');
            return;
        }
        setCategories(prev => prev.filter(c => c.id !== id));
        addNotification(`Catégorie "${categoryToDelete?.name}" supprimée.`, 'info');
    };

    const addProduct = (product: Omit<Product, 'id'|'totalSales'>) => {
        const newProduct = { ...product, id: Date.now().toString(), totalSales: 0 };
        setProducts(prev => [...prev, newProduct]);
        addNotification(`Produit "${product.name}" ajouté avec succès.`, 'success');
    };

    const updateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        addNotification(`Produit "${updatedProduct.name}" mis à jour.`, 'info');
    };
    
    const deleteProduct = (id: string) => {
        const productToDelete = products.find(p => p.id === id);
        // FIX: Completed the filter function to correctly remove the product, fixing the 'Cannot find name p' error.
        setProducts(prev => prev.filter(p => p.id !== id));
        if (productToDelete) {
            addNotification(`Produit "${productToDelete.name}" supprimé.`, 'info');
        }
    };

    const addSale = (saleData: Omit<Sale, 'id' | 'date' | 'productName' | 'total' | 'profit' | 'unitPrice'>) => {
        const product = products.find(p => p.id === saleData.productId);
        if (!product) {
            addNotification(`Produit non trouvé. ID: ${saleData.productId}`, 'error');
            return;
        }

        if (product.stock < saleData.quantity) {
            addNotification(`Stock insuffisant pour "${product.name}". Restant: ${product.stock}`, 'error');
            return;
        }

        const newSale: Sale = {
            id: Date.now().toString(),
            productId: product.id,
            productName: product.name,
            quantity: saleData.quantity,
            unitPrice: product.salePrice,
            total: product.salePrice * saleData.quantity,
            profit: (product.salePrice - product.purchasePrice) * saleData.quantity,
            date: new Date().toISOString(),
        };

        setSales(prev => [newSale, ...prev]);

        const updatedProduct: Product = {
            ...product,
            stock: product.stock - saleData.quantity,
            totalSales: (product.totalSales || 0) + saleData.quantity,
        };
        
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

        addNotification(`Vente de ${saleData.quantity}x "${product.name}" enregistrée.`, 'success');

        if (updatedProduct.stock <= 10 && updatedProduct.stock > 0) {
            addNotification(`Stock faible pour "${updatedProduct.name}"! Restant: ${updatedProduct.stock}`, 'warning');
        } else if (updatedProduct.stock === 0) {
            addNotification(`"${updatedProduct.name}" est en rupture de stock!`, 'error');
        }
    };

    const updateSettings = (newSettings: AppSettings) => {
        setSettings(newSettings);
        addNotification('Paramètres mis à jour.', 'success');
    };
    
    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard />;
            case 'products': return <Products />;
            case 'sales': return <Sales />;
            case 'categories': return <Categories />;
            case 'notifications': return <Notifications />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    };

    const navItems = [
        { view: 'dashboard', label: 'Tableau de Bord', icon: <LayoutGrid size={20} /> },
        { view: 'products', label: 'Produits', icon: <Package size={20} /> },
        { view: 'sales', label: 'Ventes', icon: <ShoppingCart size={20} /> },
        { view: 'categories', label: 'Catégories', icon: <LayoutGrid size={20} /> },
        { view: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
        { view: 'settings', label: 'Paramètres', icon: <SettingsIcon size={20} /> },
    ] as const;

    const appContextValue = {
        categories, products, sales, notifications, settings,
        addCategory, deleteCategory, addProduct, updateProduct, deleteProduct,
        addSale, formatCurrency, addNotification, updateSettings
    };

    // FIX: Added the main JSX return for the App component, which resolves the 'cannot be used as a JSX component' error.
    return (
        <AppContext.Provider value={appContextValue}>
            <div className="flex h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white font-sans">
                {/* Sidebar */}
                <aside className={`absolute top-0 left-0 z-40 w-64 h-screen bg-slate-800/50 backdrop-blur-lg border-r border-white/10 transition-transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                    <div className="flex items-center justify-between p-4 border-b border-white/20">
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">POS Pro</h1>
                        <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-1 rounded-full hover:bg-white/10">
                            <X size={20} />
                        </button>
                    </div>
                    <nav className="p-4 space-y-2">
                        {navItems.map(item => (
                            <button
                                key={item.view}
                                onClick={() => { setActiveView(item.view); setIsMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeView === item.view ? 'bg-purple-600 shadow-lg' : 'hover:bg-white/10'}`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="flex md:hidden items-center justify-between p-4 bg-slate-800/30 border-b border-white/10">
                        <h2 className="text-xl font-semibold capitalize">{activeView}</h2>
                        <button onClick={() => setIsMenuOpen(true)} className="p-1">
                            <Menu size={24} />
                        </button>
                    </header>
                    <main className="flex-1 p-6 overflow-y-auto">
                        {renderView()}
                    </main>
                </div>
                
                <AIAssistant />
            </div>
        </AppContext.Provider>
    );
}
