import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';
import { Item, Category } from '@/lib/utils';

const Inventory = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category_id: '',
    quantity: 0,
    unit: 'pcs',
    min_stock: 5,
    location: '',
    description: '',
    serial_number: ''
  });

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/categories')
      ]);
      setItems(await itemsRes.json());
      setCategories(await catsRes.json());
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
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items';
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save');

      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Error saving item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Error deleting item');
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      category_id: '',
      quantity: 0,
      unit: 'pcs',
      min_stock: 5,
      location: '',
      description: '',
      serial_number: ''
    });
  };

  const openEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      category_id: item.category_id.toString(),
      quantity: item.quantity,
      unit: item.unit,
      min_stock: item.min_stock,
      location: item.location,
      description: item.description,
      serial_number: item.serial_number || ''
    });
    setShowModal(true);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
    item.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Inventaris Barang</h1>
          <p className="text-slate-400 mt-1">Kelola stok barang dan lokasi penyimpanan dengan presisi.</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Tambah Barang
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Cari nama, SKU, atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="modern-input pl-12"
            />
          </div>
          <button className="btn-secondary">
            <Filter size={18} />
            Filter Kategori
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="table-header">
              <tr>
                <th className="px-8 py-4">SKU / SN</th>
                <th className="px-8 py-4">Nama Barang</th>
                <th className="px-8 py-4">Kategori</th>
                <th className="px-8 py-4 text-right">Stok</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="table-row group">
                  <td className="px-8 py-5">
                    <div className="font-mono text-[11px] text-slate-100">{item.sku}</div>
                    {item.serial_number && (
                      <div className="font-mono text-[10px] text-indigo-400 mt-0.5">SN: {item.serial_number}</div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-100">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-normal truncate max-w-[200px] mt-0.5">{item.description}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                      {item.category_name}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-500 mt-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                      <span className="font-mono text-[10px] uppercase tracking-tighter">{item.location || 'No Loc'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-bold text-slate-100">
                    {item.quantity} <span className="text-slate-500 text-[10px] font-normal uppercase">{item.unit}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {item.quantity <= item.min_stock ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">
                        <AlertCircle size={12} /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                        Aman
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEdit(item)}
                        className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-slate-500 italic">
                    Tidak ada barang yang ditemukan dalam database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">
                  {editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Lengkapi informasi detail barang di bawah ini.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">SKU (Kode Barang)</label>
                  <input 
                    required
                    type="text" 
                    className="modern-input"
                    placeholder="Contoh: EL-001"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Serial Number (SN)</label>
                  <input 
                    type="text" 
                    className="modern-input"
                    placeholder="Contoh: SN123456789"
                    value={formData.serial_number}
                    onChange={e => setFormData({...formData, serial_number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Barang</label>
                  <input 
                    required
                    type="text" 
                    className="modern-input"
                    placeholder="Nama lengkap barang"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kategori</label>
                  <select 
                    required
                    className="modern-input appearance-none"
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lokasi Rak</label>
                  <input 
                    type="text" 
                    className="modern-input"
                    placeholder="Contoh: Rak A-12"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                
                {!editingItem && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stok Awal</label>
                    <input 
                      type="number" 
                      min="0"
                      className="modern-input"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Satuan (Unit)</label>
                  <input 
                    type="text" 
                    placeholder="pcs, kg, box..."
                    className="modern-input"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Minimum Stok</label>
                  <input 
                    type="number" 
                    min="0"
                    className="modern-input"
                    value={formData.min_stock}
                    onChange={e => setFormData({...formData, min_stock: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deskripsi Tambahan</label>
                <textarea 
                  rows={3}
                  className="modern-input resize-none"
                  placeholder="Berikan keterangan singkat mengenai barang ini..."
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
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
