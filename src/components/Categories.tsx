import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2,
  Box,
  X,
  Search,
  Package
} from 'lucide-react';
import { Category, Item, cn } from '@/lib/utils';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryItems, setCategoryItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/categories');
      setCategories(await res.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save');

      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchData();
    } catch (error) {
      alert('Error saving category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kategori ini? Barang dengan kategori ini akan tetap ada tapi kategorinya mungkin jadi tidak valid.')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchData();
    } catch (error) {
      alert('Error deleting category');
    }
  };

  const handleViewItems = async (category: Category) => {
    setSelectedCategory(category);
    setShowItemsModal(true);
    setItemsLoading(true);
    try {
      const res = await fetch('/api/items');
      const allItems: Item[] = await res.json();
      const filtered = allItems.filter(item => item.category_id === category.id);
      setCategoryItems(filtered);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Kategori Barang</h1>
          <p className="text-slate-400 mt-1">Kelompokkan barang untuk manajemen stok yang lebih terstruktur.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Tambah Kategori
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Box size={28} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded-xl shadow-sm">
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">{cat.name}</h3>
            <p className="text-sm text-slate-500 leading-relaxed italic">
              {cat.description || 'Tidak ada deskripsi detail untuk kategori ini.'}
            </p>
            
            <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status: Aktif</span>
              <button 
                onClick={() => handleViewItems(cat)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Lihat Barang →
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card rounded-2xl">
            <div className="text-slate-500 italic">Belum ada kategori yang dibuat.</div>
          </div>
        )}
      </div>

      {/* Modal View Items */}
      {showItemsModal && selectedCategory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 sticky top-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                  <Box className="text-indigo-400" />
                  Barang di Kategori: {selectedCategory.name}
                </h2>
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Total: {categoryItems.length} Barang</p>
              </div>
              <button onClick={() => setShowItemsModal(false)} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {itemsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium italic">Memuat daftar barang...</p>
                </div>
              ) : categoryItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="p-5 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center gap-4 group hover:border-indigo-500/30 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                        <Package size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-100 truncate">{item.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.sku}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            item.quantity <= item.min_stock ? "text-rose-400" : "text-emerald-400"
                          )}>
                            Stok: {item.quantity} {item.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-4">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-300">Belum Ada Barang</h3>
                  <p className="text-slate-500 text-sm mt-1">Kategori ini masih kosong, belum ada barang yang terdaftar.</p>
                </div>
              )}
            </div>
            
            <div className="px-8 py-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => setShowItemsModal(false)}
                className="btn-secondary"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-100">Tambah Kategori</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Kategori</label>
                <input 
                  required
                  type="text" 
                  className="modern-input"
                  placeholder="Contoh: Elektronik, Furniture..."
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deskripsi Kategori</label>
                <textarea 
                  rows={3}
                  className="modern-input resize-none"
                  placeholder="Berikan penjelasan singkat mengenai kategori ini..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
