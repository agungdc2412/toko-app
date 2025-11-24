import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ScanBarcode,
  Printer,
  DollarSign,
  Users,
  LogOut,
  Lock,
  Shield,
  User,
  BookOpen,
  Clock,
  CheckCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
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
  query,
  where,
  getDocs,
  setDoc,
  orderBy
} from 'firebase/firestore';

// --- CONFIG FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyArecnB6RGZEmQOk7QG42I1Z9jjCq2d_Ek",
  authDomain: "kasir-app-3ef36.firebaseapp.com",
  projectId: "kasir-app-3ef36",
  storageBucket: "kasir-app-3ef36.firebasestorage.app",
  messagingSenderId: "21188971040",
  appId: "1:21188971040:web:290a36cb7561d516314a45",
  measurementId: "G-31QRSMQ3WP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const STORE_ID = 'toko_utama_v1'; 
const BASE_PATH = `artifacts/${STORE_ID}`;

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// --- Modules & Components ---

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkInit = async () => {
      const q = query(collection(db, `${BASE_PATH}/users`));
      const snap = await getDocs(q);
      if (snap.empty) {
        await setDoc(doc(db, `${BASE_PATH}/users`, 'owner'), {
          username: 'owner', password: '123', role: 'owner', name: 'Pemilik Toko'
        });
      }
    };
    checkInit();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const q = query(collection(db, `${BASE_PATH}/users`), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) { setError('Username salah'); setLoading(false); return; }

      let userData = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.password === password) userData = { id: doc.id, ...data };
      });

      if (userData) onLogin(userData);
      else setError('Password salah');
    } catch (err) { setError('Koneksi error'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center bg-emerald-600">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600"><Lock size={32} /></div>
          <h1 className="text-2xl font-bold text-white">Kelontong Pro</h1>
          <p className="text-emerald-100 text-sm">Login Akses Toko</p>
        </div>
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">{error}</div>}
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Username</label><input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" value={username} onChange={e => setUsername(e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Password</label><input type="password" required className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} /></div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50">{loading ? 'Memeriksa...' : 'Masuk Sistem'}</button>
        </form>
      </div>
    </div>
  );
};

const Navigation = ({ activeTab, setActiveTab, isMobile, isOpen, setIsOpen, userRole, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'admin'] },
    { id: 'kasir', label: 'Kasir', icon: ShoppingCart, roles: ['owner', 'admin', 'pegawai'] },
    { id: 'kasbon', label: 'Buku Utang', icon: BookOpen, roles: ['owner', 'admin'] }, // NEW
    { id: 'stok', label: 'Stok & Modal', icon: Package, roles: ['owner', 'admin'] },
    { id: 'users', label: 'User', icon: Users, roles: ['owner'] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(userRole));
  const handleNavClick = (id) => { setActiveTab(id); if (isMobile) setIsOpen(false); };

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl flex flex-col`}>
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <div><h1 className="text-xl font-bold text-emerald-400">Kelontong<span className="text-white">Pro</span></h1><span className="text-xs text-slate-400 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">{userRole}</span></div>
        {isMobile && <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>}
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {allowedItems.map((item) => (
          <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}><item.icon size={20} /><span className="font-medium">{item.label}</span></button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800"><button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"><LogOut size={20} /><span className="font-medium">Keluar</span></button></div>
    </div>
  );
};

// --- MODULES ---

const DashboardModule = ({ products, transactions, userRole, debts }) => {
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalProfit = 0;
    // Hitung piutang belum lunas
    const totalDebt = debts.reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0);

    transactions.forEach(tx => {
      // Hanya hitung revenue jika transaksi LUNAS (bukan kasbon)
      if(tx.paymentType !== 'kasbon') {
         totalRevenue += (tx.total || 0);
         if(tx.items) {
          tx.items.forEach(item => {
            const revenue = item.price * item.qty;
            const cost = (item.buyPrice || 0) * item.qty;
            totalProfit += (revenue - cost);
          });
        }
      }
    });

    const totalTransactions = transactions.length;
    const lowStockItems = products.filter(p => p.stock <= 5).length;
    const recentSales = [...transactions].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5);

    return { totalRevenue, totalProfit, totalTransactions, lowStockItems, recentSales, totalDebt };
  }, [products, transactions, debts]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Ringkasan Bisnis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4"><div className="p-3 bg-emerald-100 rounded-full text-emerald-600"><TrendingUp size={24} /></div><span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Cash Masuk</span></div>
          <p className="text-sm text-slate-500">Omzet Tunai</p><h3 className="text-xl font-bold text-slate-800">{formatRupiah(stats.totalRevenue)}</h3>
        </div>

        {userRole === 'owner' ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 ring-2 ring-emerald-500/20">
            <div className="flex items-center justify-between mb-4"><div className="p-3 bg-green-100 rounded-full text-green-700"><DollarSign size={24} /></div><span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">Profit</span></div>
            <p className="text-sm text-slate-500">Laba Bersih (Estimasi)</p><h3 className="text-xl font-bold text-green-700">{formatRupiah(stats.totalProfit)}</h3>
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400"><Lock size={24} className="mb-2"/><span className="text-xs font-medium">Info Profit Terkunci</span></div>
        )}

        {/* KARTU BARU: TOTAL PIUTANG */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4"><div className="p-3 bg-red-100 rounded-full text-red-600"><BookOpen size={24} /></div><span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Tertahan</span></div>
          <p className="text-sm text-slate-500">Total Kasbon Pelanggan</p><h3 className="text-xl font-bold text-slate-800">{formatRupiah(stats.totalDebt)}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4"><div className="p-3 bg-orange-100 rounded-full text-orange-600"><AlertTriangle size={24} /></div>{stats.lowStockItems > 0 && (<span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Cek Stok</span>)}</div>
          <p className="text-sm text-slate-500">Stok Menipis</p><h3 className="text-xl font-bold text-slate-800">{stats.lowStockItems} Item</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-800">Aktivitas Terakhir</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm"><tr><th className="p-4">Waktu</th><th className="p-4">Tipe</th><th className="p-4 text-right">Total</th></tr></thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {stats.recentSales.map(tx => (
                <tr key={tx.id}>
                  <td className="p-4"><div className="font-medium text-slate-800">{tx.createdAt ? new Date(tx.createdAt.seconds * 1000).toLocaleString('id-ID') : '-'}</div></td>
                  <td className="p-4">
                    {tx.paymentType === 'kasbon' ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Kasbon: {tx.customerName}</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Tunai</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-medium text-emerald-600">{formatRupiah(tx.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InventoryModule = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', barcode: '', buyPrice: '', price: '', stock: '', category: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name: formData.name, barcode: formData.barcode || '-', buyPrice: Number(formData.buyPrice), price: Number(formData.price), stock: Number(formData.stock), category: formData.category || 'Umum' };
    if (editingProduct) onUpdateProduct(editingProduct.id, payload); else onAddProduct(payload);
    closeModal();
  };
  const openModal = (product = null) => {
    if (product) { setEditingProduct(product); setFormData({ ...product, barcode: product.barcode || '' }); } 
    else { setEditingProduct(null); setFormData({ name: '', barcode: '', buyPrice: '', price: '', stock: '', category: '' }); }
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingProduct(null); };
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode && p.barcode.includes(searchTerm)));

  return (
    <div className="space-y-4 h-full flex flex-col pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h2 className="text-2xl font-bold text-slate-800">Stok & Modal</h2>
        <button onClick={() => openModal()} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"><Plus size={18} /><span>Tambah Barang</span></button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Cari..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-sm sticky top-0 z-10 shadow-sm"><tr><th className="p-4">Produk</th>{userRole === 'owner' && <th className="p-4 text-right">H. Modal</th>}<th className="p-4 text-right">H. Jual</th><th className="p-4 text-center">Stok</th><th className="p-4 text-center">Aksi</th></tr></thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="p-4"><div className="font-medium text-slate-800">{product.name}</div><div className="text-xs text-slate-500">{product.barcode} • {product.category}</div></td>
                  {userRole === 'owner' && <td className="p-4 text-right text-slate-500">{formatRupiah(product.buyPrice || 0)}</td>}
                  <td className="p-4 text-right font-medium">{formatRupiah(product.price)}</td>
                  <td className="p-4 text-center">{product.stock}</td>
                  <td className="p-4"><div className="flex justify-center space-x-2"><button onClick={() => openModal(product)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>{userRole === 'owner' && (<button onClick={() => onDeleteProduct(product.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
             <div className="p-4 border-b flex justify-between bg-slate-50"><h3 className="font-bold">Form Barang</h3><button onClick={closeModal}><X size={20}/></button></div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Nama Barang" className="col-span-2 p-2 border rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/>
                  <input placeholder="Barcode" className="col-span-2 p-2 border rounded" value={formData.barcode} onChange={e=>setFormData({...formData, barcode: e.target.value})}/>
                  <input placeholder="Stok" type="number" className="p-2 border rounded" value={formData.stock} onChange={e=>setFormData({...formData, stock: e.target.value})}/>
                  <input placeholder="Kategori" className="p-2 border rounded" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}/>
                  {userRole === 'owner' && <input placeholder="Harga Beli (Modal)" type="number" className="p-2 border rounded bg-slate-50" value={formData.buyPrice} onChange={e=>setFormData({...formData, buyPrice: e.target.value})}/>}
                  <input placeholder="Harga Jual" type="number" className="p-2 border rounded font-bold" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})}/>
                </div>
                <button className="w-full bg-emerald-600 text-white py-2 rounded">Simpan</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MODULE BARU: BUKU KASBON ---
const DebtModule = ({ debts, onPayDebt }) => {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const handlePay = (e) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if (amount <= 0 || amount > selectedDebt.remainingAmount) return alert('Jumlah pembayaran tidak valid');
    onPayDebt(selectedDebt.id, amount, selectedDebt.remainingAmount);
    setSelectedDebt(null); setPayAmount('');
  };

  // Urutkan yang utangnya paling besar di atas
  const sortedDebts = [...debts].sort((a, b) => b.remainingAmount - a.remainingAmount);

  return (
    <div className="space-y-6 pb-10">
      <h2 className="text-2xl font-bold text-slate-800">Buku Utang / Kasbon</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDebts.length === 0 && <div className="col-span-full text-center p-8 text-slate-400">Tidak ada data kasbon. Aman!</div>}
        {sortedDebts.map(debt => (
          <div key={debt.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-800">{debt.customerName}</h3>
                <span className="text-xs text-slate-400">{new Date(debt.createdAt?.seconds * 1000).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Sisa Utang:</p>
              <h4 className="text-2xl font-bold text-red-600 mb-4">{formatRupiah(debt.remainingAmount)}</h4>
              <div className="text-xs text-slate-400 border-t pt-2 mb-4">
                Awal: {formatRupiah(debt.totalAmount)}
              </div>
            </div>
            <button 
              onClick={() => { setSelectedDebt(debt); setPayAmount(''); }}
              className="w-full py-2 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 border border-emerald-200"
            >
              Bayar Cicilan / Lunas
            </button>
          </div>
        ))}
      </div>

      {/* Modal Bayar Utang */}
      {selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-4">Bayar Utang: {selectedDebt.customerName}</h3>
            <p className="text-sm text-slate-500 mb-2">Sisa Tagihan: <span className="font-bold text-red-600">{formatRupiah(selectedDebt.remainingAmount)}</span></p>
            <form onSubmit={handlePay}>
              <input 
                type="number" autoFocus
                className="w-full p-3 border rounded-lg font-bold text-lg mb-4" 
                placeholder="Masukkan jumlah bayar"
                value={payAmount} onChange={e=>setPayAmount(e.target.value)}
              />
              <div className="flex gap-2">
                <button type="button" onClick={()=>setSelectedDebt(null)} className="flex-1 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold">Bayar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const POSModule = ({ products, onCheckout }) => {
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  
  // Kasbon States
  const [isKasbonMode, setIsKasbonMode] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const barcodeInputRef = useRef(null);
  useEffect(() => { if(barcodeInputRef.current) barcodeInputRef.current.focus(); }, []);

  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Stok habis!');
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return current;
        return current.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, { ...product, qty: 1 }];
    });
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if(!barcodeInput) return;
    const found = products.find(p => p.barcode === barcodeInput);
    if(found) { addToCart(found); setBarcodeInput(''); } else { alert('Barcode tidak ditemukan!'); }
  };

  const updateQty = (id, delta) => {
    setCart(current => current.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQty = item.qty + delta;
        if (newQty > 0 && newQty <= product.stock) return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const processPayment = () => {
    if (cart.length === 0) return;
    
    if (isKasbonMode && !customerName.trim()) {
      alert("Wajib isi Nama Pelanggan untuk Kasbon!");
      return;
    }

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    // Data untuk struk & database
    const txData = { 
      id: "TRX-" + Date.now().toString().slice(-6), 
      date: new Date().toLocaleString(), 
      items: [...cart], 
      total: cartTotal,
      paymentType: isKasbonMode ? 'kasbon' : 'tunai',
      customerName: isKasbonMode ? customerName : 'Umum'
    };

    setReceiptData(txData);
    onCheckout(cart, cartTotal, txData); // Kirim data lengkap ke App
    
    // Reset form
    setCart([]);
    setShowCartMobile(false);
    setIsKasbonMode(false);
    setCustomerName('');
  };

  const printReceipt = () => {
    const printContent = document.getElementById('receipt-area').innerHTML;
    const win = window.open('', '', 'height=500,width=400');
    win.document.write('<html><head><title>Struk</title></head><body>' + printContent + '</body></html>');
    win.document.close();
    win.print();
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-full gap-4 relative pb-20">
      <div className="flex-1 flex flex-col h-full">
        {/* Search & Barcode same as before */}
        <div className="mb-4 space-y-3">
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ScanBarcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600" size={20} />
                <input ref={barcodeInputRef} type="text" placeholder="Scan Barcode..." className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-emerald-100 focus:border-emerald-500 outline-none" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} />
              </div>
              <button type="submit" className="bg-emerald-600 text-white px-6 rounded-xl font-medium">Scan</button>
            </div>
          </form>
        </div>
        {/* Product List */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pb-20 md:pb-0 pr-1">
          {products.map(product => (
            <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0} className={`text-left p-4 rounded-xl border flex flex-col justify-between h-32 ${product.stock > 0 ? 'bg-white border-slate-200 hover:border-emerald-500' : 'bg-slate-50 opacity-60'}`}>
              <div><h4 className="font-semibold text-slate-800 line-clamp-2">{product.name}</h4></div>
              <div className="flex justify-between items-end mt-2"><span className="font-bold text-emerald-600">{formatRupiah(product.price)}</span><span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{product.stock}</span></div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Cart UI */}
      <div className={`fixed inset-0 z-40 bg-slate-900 bg-opacity-50 md:hidden transition-opacity ${showCartMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowCartMobile(false)} />
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 flex flex-col md:relative md:transform-none md:w-96 md:rounded-xl md:shadow-sm md:border md:border-slate-200 ${showCartMobile ? 'translate-y-0 h-[85vh]' : 'translate-y-full md:translate-y-0 h-full'}`}>
         <div className="p-4 border-b bg-slate-50 flex justify-between items-center md:rounded-t-xl"><h3 className="font-bold">Keranjang</h3><button onClick={() => setShowCartMobile(false)} className="md:hidden"><X/></button></div>
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map(item => (
               <div key={item.id} className="flex justify-between items-center bg-white border p-3 rounded-lg"><div className="flex-1"><h4 className="font-medium text-sm">{item.name}</h4><p className="text-emerald-600 text-xs font-bold">{formatRupiah(item.price * item.qty)}</p></div><div className="flex items-center gap-2"><button onClick={()=>updateQty(item.id, -1)} className="p-1 bg-slate-100 rounded"><Minus size={12}/></button><span className="text-sm font-bold">{item.qty}</span><button onClick={()=>updateQty(item.id, 1)} className="p-1 bg-slate-100 rounded"><Plus size={12}/></button></div></div>
            ))}
         </div>
         
         {/* PAYMENT SECTION (UPDATED) */}
         <div className="p-4 border-t bg-slate-50 md:rounded-b-xl space-y-3">
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatRupiah(cartTotal)}</span></div>
            
            {/* Toggle Kasbon */}
            <div className="flex items-center justify-between bg-white p-2 rounded border">
               <label className="text-sm flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" checked={isKasbonMode} onChange={e => setIsKasbonMode(e.target.checked)} />
                 <span className={isKasbonMode ? "font-bold text-red-600" : "text-slate-600"}>Catat sebagai Kasbon (Utang)</span>
               </label>
            </div>

            {isKasbonMode && (
              <input 
                type="text" 
                className="w-full p-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Masukkan Nama Pelanggan..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            )}

            <button 
              onClick={processPayment} 
              disabled={cart.length===0} 
              className={`w-full text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 ${isKasbonMode ? 'bg-red-600' : 'bg-emerald-600'}`}
            >
              {isKasbonMode ? 'Simpan Kasbon' : 'Bayar Tunai & Cetak'}
            </button>
         </div>
      </div>
      {!showCartMobile && cart.length > 0 && <div className="fixed bottom-4 left-4 right-4 md:hidden z-30"><button onClick={() => setShowCartMobile(true)} className="w-full bg-slate-900 text-white p-4 rounded-xl shadow-xl flex justify-between items-center"><span className="font-bold">{cart.reduce((a,b)=>a+b.qty,0)} Item</span><span className="font-bold text-emerald-400">{formatRupiah(cartTotal)}</span></button></div>}
      
      {/* Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
           <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
              <div className={`p-4 text-white flex justify-between items-center ${receiptData.paymentType === 'kasbon' ? 'bg-red-600' : 'bg-emerald-600'}`}>
                <h3 className="font-bold">{receiptData.paymentType === 'kasbon' ? 'Kasbon Tercatat' : 'Transaksi Berhasil'}</h3>
                <button onClick={()=>setReceiptData(null)}><X/></button>
              </div>
              <div className="p-6 bg-slate-50 flex justify-center">
                <div id="receipt-area" className="bg-white p-4 shadow-sm border w-full text-xs font-mono">
                  <div className="text-center font-bold text-sm mb-2">TOKO ANDA</div>
                  <div className="flex justify-between mb-2"><span>{receiptData.id}</span><span>{receiptData.date}</span></div>
                  <hr className="border-dashed my-2"/>
                  {receiptData.items.map((i,x)=><div key={x} className="flex justify-between mb-1"><span>{i.name} x{i.qty}</span><span>{i.price*i.qty}</span></div>)}
                  <hr className="border-dashed my-2"/>
                  <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span>{formatRupiah(receiptData.total)}</span></div>
                  <div className="text-center mt-2 font-bold">{receiptData.paymentType === 'kasbon' ? `(KASBON: ${receiptData.customerName})` : '(LUNAS)'}</div>
                </div>
              </div>
              <div className="p-4 flex gap-3"><button onClick={printReceipt} className="flex-1 bg-slate-900 text-white py-2 rounded-lg flex justify-center items-center gap-2"><Printer size={16}/> Print</button></div>
           </div>
        </div>
      )}
    </div>
  );
};

const UserManagementModule = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'pegawai', name: '' });

  useEffect(() => {
    const q = query(collection(db, `${BASE_PATH}/users`));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if(!formData.username || !formData.password) return;
    try {
      await setDoc(doc(db, `${BASE_PATH}/users`, formData.username), formData);
      setFormData({ username: '', password: '', role: 'pegawai', name: '' });
      alert('User berhasil dibuat');
    } catch (e) { alert('Gagal: ' + e.message); }
  };

  const handleDeleteUser = async (id) => {
    if(id === 'owner') return alert('Tidak bisa menghapus Owner utama');
    if(confirm('Hapus user ini?')) {
      await deleteDoc(doc(db, `${BASE_PATH}/users`, id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Tambah User</h3>
          <form onSubmit={handleAddUser} className="space-y-3">
            <div><label className="text-xs font-bold text-slate-500">Nama</label><input className="w-full p-2 border rounded-lg" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required /></div>
            <div><label className="text-xs font-bold text-slate-500">Username</label><input className="w-full p-2 border rounded-lg" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} required /></div>
            <div><label className="text-xs font-bold text-slate-500">Password</label><input className="w-full p-2 border rounded-lg" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required /></div>
            <div>
              <label className="text-xs font-bold text-slate-500">Akses</label>
              <select className="w-full p-2 border rounded-lg bg-slate-50" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})}>
                <option value="pegawai">Pegawai (Kasir)</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <button className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold mt-2">Buat</button>
          </form>
        </div>
        <div className="md:col-span-2 space-y-3">
          {users.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${u.role === 'owner' ? 'bg-purple-100 text-purple-600' : u.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>{u.role === 'owner' ? <Shield size={20}/> : u.role === 'admin' ? <Lock size={20}/> : <User size={20}/>}</div>
                <div><h4 className="font-bold text-slate-800">{u.name}</h4><p className="text-xs text-slate-500 uppercase font-bold">{u.role}</p></div>
              </div>
              {u.role !== 'owner' && <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 size={18}/></button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]); // State baru untuk utang
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
      else await signInAnonymously(auth);
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => { unsubscribe(); window.removeEventListener('resize', handleResize); };
  }, []);

  useEffect(() => {
    if (!appUser) return;
    const productsRef = collection(db, BASE_PATH, 'products');
    const transactionsRef = collection(db, BASE_PATH, 'transactions');
    const debtsRef = collection(db, BASE_PATH, 'debts'); // Referensi koleksi utang

    const unsubProducts = onSnapshot(productsRef, (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTransactions = onSnapshot(transactionsRef, (s) => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubDebts = onSnapshot(debtsRef, (s) => setDebts(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubProducts(); unsubTransactions(); unsubDebts(); };
  }, [appUser]);

  const handleAddProduct = async (data) => { await addDoc(collection(db, BASE_PATH, 'products'), { ...data, createdAt: serverTimestamp() }); };
  const handleUpdateProduct = async (id, data) => { await updateDoc(doc(db, BASE_PATH, 'products', id), data); };
  const handleDeleteProduct = async (id) => { if(confirm('Hapus?')) await deleteDoc(doc(db, BASE_PATH, 'products', id)); };
  
  // Handle Checkout (Updated for Debt)
  const handleCheckout = async (cartItems, total, txData) => {
    // 1. Simpan Transaksi
    await addDoc(collection(db, BASE_PATH, 'transactions'), { ...txData, createdAt: serverTimestamp(), cashier: appUser.username });
    
    // 2. Potong Stok
    cartItems.forEach(async (item) => {
      const currentStock = products.find(p => p.id === item.id)?.stock || 0;
      await updateDoc(doc(db, BASE_PATH, 'products', item.id), { stock: Math.max(0, currentStock - item.qty) });
    });

    // 3. Jika Kasbon, Simpan ke Buku Utang
    if(txData.paymentType === 'kasbon') {
      await addDoc(collection(db, BASE_PATH, 'debts'), {
        customerName: txData.customerName,
        totalAmount: total,
        remainingAmount: total,
        createdAt: serverTimestamp(),
        history: []
      });
    }
  };

  // Handle Bayar Utang
  const handlePayDebt = async (id, amount, currentRemaining) => {
    const newRemaining = currentRemaining - amount;
    const historyItem = { date: new Date().toISOString(), amount: amount, cashier: appUser.username };
    
    if(newRemaining <= 0) {
      // Lunas -> Hapus dari buku utang aktif (opsional: bisa dipindah ke history lunas)
      await deleteDoc(doc(db, BASE_PATH, 'debts', id));
      alert('Utang Lunas!');
    } else {
      // Cicil -> Update sisa
      const debtRef = doc(db, BASE_PATH, 'debts', id);
      // Kita perlu cara update array history, tapi sederhananya update sisa dulu
      await updateDoc(debtRef, { remainingAmount: newRemaining });
      alert('Pembayaran cicilan berhasil dicatat');
    }
    
    // Catat sebagai pemasukan transaksi "Bayar Utang" agar kas balance (Opsional, di sini kita catat sbg transaksi baru tipe 'cicilan')
    await addDoc(collection(db, BASE_PATH, 'transactions'), {
      items: [{name: 'Pembayaran Utang', qty: 1, price: amount}],
      total: amount,
      paymentType: 'cicilan_utang',
      createdAt: serverTimestamp(),
      cashier: appUser.username
    });
  };

  if (!firebaseUser) return <div className="flex items-center justify-center h-screen bg-slate-900 text-emerald-400">Menghubungkan...</div>;
  if (!appUser) return <LoginScreen onLogin={(user) => { setAppUser(user); if (user.role === 'pegawai') setActiveTab('kasir'); else setActiveTab('dashboard'); }} />;

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} userRole={appUser.role} onLogout={() => setAppUser(null)} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center"><h1 className="font-bold text-slate-800 text-lg capitalize">{activeTab}</h1><button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600"><Menu size={24} /></button></div>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <DashboardModule products={products} transactions={transactions} debts={debts} userRole={appUser.role} />}
            {activeTab === 'stok' && <InventoryModule products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} userRole={appUser.role}/>}
            {activeTab === 'kasir' && <POSModule products={products} onCheckout={handleCheckout} />}
            {activeTab === 'kasbon' && <DebtModule debts={debts} onPayDebt={handlePayDebt} />}
            {activeTab === 'users' && <UserManagementModule />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
