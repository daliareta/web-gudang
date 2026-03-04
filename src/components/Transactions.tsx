import React, { useEffect, useState } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Search,
  Filter
} from 'lucide-react';
import { Transaction, Item, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  
  // Form State
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: 1,
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [txRes, itemsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/items')
      ]);
      setTransactions(await txRes.json());
      setItems(await itemsRes.json());
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
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      setFormData({ item_id: '', quantity: 1, notes: '' });
      fetchData();
      alert('Transaksi berhasil dicatat!');
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const selectedItem = items.find(i => i.id.toString() === formData.item_id);

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Transaksi Stok</h1>
        <p className="text-slate-400 mt-1">Catat dan pantau arus barang masuk serta keluar secara akurat.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 rounded-3xl sticky top-10">
            <h2 className="text-xl font-bold text-slate-100 mb-8">Catat Transaksi</h2>
            
            <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mb-8 border border-slate-800">
              <button
                onClick={() => setType('IN')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  type === 'IN' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <ArrowDownRight size={16} /> Masuk
              </button>
              <button
                onClick={() => setType('OUT')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  type === 'OUT' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <ArrowUpRight size={16} /> Keluar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pilih Barang</label>
                <select 
                  required
                  className="modern-input appearance-none"
                  value={formData.item_id}
                  onChange={e => setFormData({...formData, item_id: e.target.value})}
                >
                  <option value="">-- Pilih Barang --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.sku} - {item.name} (Stok: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jumlah Unit</label>
                <div className="flex items-center gap-3">
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="flex-1 modern-input"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  />
                  <div className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {selectedItem?.unit || 'unit'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Catatan Transaksi</label>
                <textarea 
                  rows={3}
                  placeholder="Berikan alasan atau detail transaksi..."
                  className="modern-input resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-white transition-all shadow-lg",
                  type === 'IN' 
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" 
                    : "bg-orange-600 hover:bg-orange-500 shadow-orange-500/20"
                )}
              >
                {type === 'IN' ? 'Konfirmasi Masuk' : 'Konfirmasi Keluar'}
              </button>
            </form>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">Riwayat Transaksi</h2>
              <div className="p-2 bg-slate-800 rounded-xl">
                <Search size={18} className="text-slate-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="table-header">
                  <tr>
                    <th className="px-8 py-4">Waktu</th>
                    <th className="px-8 py-4">Item</th>
                    <th className="px-8 py-4">Tipe</th>
                    <th className="px-8 py-4 text-right">Jumlah</th>
                    <th className="px-8 py-4">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="table-row">
                      <td className="px-8 py-5 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {format(new Date(tx.date), 'dd MMM HH:mm', { locale: id })}
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-100">{tx.item_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{tx.sku}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          tx.type === 'IN' 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        )}>
                          {tx.type === 'IN' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                          {tx.type === 'IN' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-mono font-bold text-slate-100">
                        {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                      </td>
                      <td className="px-8 py-5 text-slate-500 max-w-xs truncate italic">"{tx.notes || '-'}"</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center text-slate-500 italic">
                        Belum ada riwayat transaksi yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
