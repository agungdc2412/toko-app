import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Minus,
  Menu,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

// --- CONFIG FIREBASE ---
// GANTI BAGIAN INI DENGAN CONFIG DARI FIREBASE CONSOLE ANDA
const firebaseConfig = {
  apiKey: 'AIzaSyArecnB6RGZEmQOk7QG42I1Z9jjCq2d_Ek',
  authDomain: 'kasir-app-3ef36.firebaseapp.com',
  projectId: 'kasir-app-3ef36',
  storageBucket: 'kasir-app-3ef36.firebasestorage.app',
  messagingSenderId: '21188971040',
  appId: '1:21188971040:web:290a36cb7561d516314a45',
  measurementId: 'G-31QRSMQ3WP',
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'toko-kelontong-saya'; // Bebas diganti nama tokonya

// --- Utility Functions ---
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

// --- Components ---

// 1. Sidebar / Navigation
const Navigation = ({
  activeTab,
  setActiveTab,
  isMobile,
  isOpen,
  setIsOpen,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kasir', label: 'Kasir', icon: ShoppingCart },
    { id: 'stok', label: 'Stok Barang', icon: Package },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (isMobile) setIsOpen(false);
  };

  return (
    <div
      className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 shadow-xl flex flex-col
    `}
    >
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-emerald-400">
          Kelontong<span className="text-white">Pos</span>
        </h1>
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v1.0.0 • Online Mode
      </div>
    </div>
  );
};

// 2. Dashboard Module
const DashboardModule = ({ products, transactions }) => {
  const stats = useMemo(() => {
    const totalRevenue = transactions.reduce(
      (acc, curr) => acc + (curr.total || 0),
      0
    );
    const totalTransactions = transactions.length;
    const lowStockItems = products.filter((p) => p.stock <= 5).length;

    // Simple grouping for recent sales
    const recentSales = [...transactions]
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 5);

    return { totalRevenue, totalTransactions, lowStockItems, recentSales };
  }, [products, transactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Ringkasan Toko</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              Total
            </span>
          </div>
          <p className="text-sm text-slate-500">Pemasukan</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {formatRupiah(stats.totalRevenue)}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <ShoppingCart size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-500">Total Transaksi</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {stats.totalTransactions}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <AlertTriangle size={24} />
            </div>
            {stats.lowStockItems > 0 && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                Perhatian
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">Stok Menipis (≤ 5)</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {stats.lowStockItems} Item
          </h3>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Transaksi Terakhir</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm">
              <tr>
                <th className="p-4">ID / Waktu</th>
                <th className="p-4">Items</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {stats.recentSales.map((tx) => (
                <tr key={tx.id}>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">
                      #{tx.id.slice(0, 6)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {tx.createdAt
                        ? new Date(
                            tx.createdAt.seconds * 1000
                          ).toLocaleTimeString()
                        : 'Baru saja'}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    {tx.items.length} jenis barang
                  </td>
                  <td className="p-4 text-right font-medium text-emerald-600">
                    {formatRupiah(tx.total)}
                  </td>
                </tr>
              ))}
              {stats.recentSales.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-400">
                    Belum ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. Inventory Module (CRUD)
const InventoryModule = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: formData.category || 'Umum',
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, payload);
    } else {
      onAddProduct(payload);
    }
    closeModal();
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '', category: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h2 className="text-2xl font-bold text-slate-800">Stok Barang</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus size={18} />
          <span>Tambah Barang</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Cari nama barang..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table - Responsive using simplified card view on mobile could be an option, but keeping table with scroll for now */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-sm sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4">Nama Barang</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga</th>
                <th className="p-4 text-center">Stok</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">
                    {product.name}
                  </td>
                  <td className="p-4 text-slate-500">{product.category}</td>
                  <td className="p-4">{formatRupiah(product.price)}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.stock <= 5
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => openModal(product)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Tidak ada barang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">
                {editingProduct ? 'Edit Barang' : 'Tambah Barang Baru'}
              </h3>
              <button onClick={closeModal}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Barang
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Minuman, Makanan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Stok Awal
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. POS / Kasir Module
const POSModule = ({ products, onCheckout }) => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCartMobile, setShowCartMobile] = useState(false);

  const addToCart = (product) => {
    if (product.stock <= 0) return;

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        // Don't add if exceeds stock
        if (existing.qty >= product.stock) return current;
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...current, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((current) =>
      current.map((item) => {
        if (item.id === id) {
          const product = products.find((p) => p.id === id);
          const newQty = item.qty + delta;
          if (newQty > 0 && newQty <= product.stock) {
            return { ...item, qty: newQty };
          }
          return item; // No change if invalid
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onCheckout(cart, cartTotal);
    setCart([]);
    setShowCartMobile(false);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-full gap-4 relative">
      {/* Product List Area */}
      <div className="flex-1 flex flex-col h-full">
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari barang untuk dijual..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pb-20 md:pb-0 pr-1">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between h-32
                ${
                  product.stock > 0
                    ? 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md cursor-pointer'
                    : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                }
              `}
            >
              <div>
                <h4 className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                  {product.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {product.category}
                </p>
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-emerald-600">
                  {formatRupiah(product.price)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    product.stock > 0
                      ? 'bg-slate-100'
                      : 'bg-red-100 text-red-500'
                  }`}
                >
                  Stok: {product.stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Area (Sidebar on Desktop, Bottom Sheet/Modal on Mobile) */}
      <div
        className={`
        fixed inset-0 z-40 bg-slate-900 bg-opacity-50 md:hidden transition-opacity
        ${
          showCartMobile
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }
      `}
        onClick={() => setShowCartMobile(false)}
      />

      <div
        className={`
        fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] 
        transform transition-transform duration-300 flex flex-col
        md:relative md:transform-none md:w-96 md:rounded-xl md:shadow-sm md:border md:border-slate-200
        ${
          showCartMobile
            ? 'translate-y-0 h-[80vh]'
            : 'translate-y-full md:translate-y-0 h-full'
        }
      `}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 md:rounded-t-xl">
          <div className="flex items-center space-x-2">
            <ShoppingCart size={20} className="text-slate-600" />
            <h3 className="font-bold text-slate-800">Keranjang</h3>
            <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
              {cart.reduce((a, b) => a + b.qty, 0)}
            </span>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setShowCartMobile(false)}
            className="md:hidden p-1 text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-lg shadow-sm"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800 text-sm line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-emerald-600 font-bold text-xs">
                    {formatRupiah(item.price * item.qty)}
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-1">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="p-1 hover:bg-white rounded shadow-sm text-slate-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="p-1 hover:bg-white rounded shadow-sm text-slate-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Total */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 md:rounded-b-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500">Total Tagihan</span>
            <span className="text-2xl font-bold text-slate-800">
              {formatRupiah(cartTotal)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition"
          >
            <Save size={20} />
            <span>Bayar Sekarang</span>
          </button>
        </div>
      </div>

      {/* Floating Button for Mobile to Open Cart */}
      {!showCartMobile && cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-30">
          <button
            onClick={() => setShowCartMobile(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-xl shadow-xl flex justify-between items-center animate-bounce-subtle"
          >
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500 px-2 py-0.5 rounded-md text-xs font-bold">
                {cart.reduce((a, b) => a + b.qty, 0)} Item
              </span>
              <span className="font-medium">Lihat Keranjang</span>
            </div>
            <span className="font-bold text-emerald-400">
              {formatRupiah(cartTotal)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main App Container ---
const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Auth & Initial Load
  useEffect(() => {
    const initAuth = async () => {
      // Logic untuk lingkungan preview ini saja
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user) return;

    // Use specific user path
    const userPath = `artifacts/${appId}/users/${user.uid}`;

    const productsRef = collection(db, userPath, 'products');
    const transactionsRef = collection(db, userPath, 'transactions');

    const unsubProducts = onSnapshot(
      productsRef,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(items);
      },
      (error) => console.error('Err products:', error)
    );

    const unsubTransactions = onSnapshot(
      transactionsRef,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(items);
      },
      (error) => console.error('Err transactions:', error)
    );

    return () => {
      unsubProducts();
      unsubTransactions();
    };
  }, [user]);

  // Firestore Operations
  const handleAddProduct = async (data) => {
    if (!user) return;
    try {
      await addDoc(
        collection(db, `artifacts/${appId}/users/${user.uid}/products`),
        {
          ...data,
          createdAt: serverTimestamp(),
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProduct = async (id, data) => {
    if (!user) return;
    try {
      await updateDoc(
        doc(db, `artifacts/${appId}/users/${user.uid}/products`, id),
        data
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!user) return;
    if (confirm('Yakin ingin menghapus barang ini?')) {
      try {
        await deleteDoc(
          doc(db, `artifacts/${appId}/users/${user.uid}/products`, id)
        );
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCheckout = async (cartItems, total) => {
    if (!user) return;

    try {
      // 1. Record Transaction
      await addDoc(
        collection(db, `artifacts/${appId}/users/${user.uid}/transactions`),
        {
          items: cartItems,
          total,
          createdAt: serverTimestamp(),
        }
      );

      // 2. Update Stocks
      cartItems.forEach(async (item) => {
        const productRef = doc(
          db,
          `artifacts/${appId}/users/${user.uid}/products`,
          item.id
        );
        const currentStock = products.find((p) => p.id === item.id)?.stock || 0;
        await updateDoc(productRef, {
          stock: Math.max(0, currentStock - item.qty),
        });
      });

      setActiveTab('dashboard');
    } catch (e) {
      console.error('Checkout failed', e);
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-400">
        Memuat Data... (Pastikan Config Firebase Benar)
      </div>
    );

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobile={isMobile}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h1 className="font-bold text-slate-800 text-lg capitalize">
            {activeTab}
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-slate-600"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Content Body */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'dashboard' && (
              <DashboardModule
                products={products}
                transactions={transactions}
              />
            )}

            {activeTab === 'stok' && (
              <InventoryModule
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'kasir' && (
              <POSModule products={products} onCheckout={handleCheckout} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
