import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DashboardStats, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!stats) return <div className="p-8">Error loading data</div>;

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Selamat datang kembali, berikut ringkasan gudang Anda.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full">
          {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-white">
            <Package size={80} />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl w-fit mb-6 border border-blue-500/20">
              <Package size={24} />
            </div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Item</div>
            <div className="text-4xl font-bold text-slate-100">{stats.totalItems}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-400 bg-blue-500/10 w-fit px-2 py-1 rounded-md border border-blue-500/10">
              Aktif di sistem
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-white">
            <TrendingUp size={80} />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-6 border border-emerald-500/20">
              <TrendingUp size={24} />
            </div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Stok</div>
            <div className="text-4xl font-bold text-slate-100">{stats.totalStock}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-md border border-emerald-500/10">
              Unit tersedia
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-white">
            <AlertTriangle size={80} />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl w-fit mb-6 border border-rose-500/20">
              <AlertTriangle size={24} />
            </div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Stok Menipis</div>
            <div className="text-4xl font-bold text-slate-100">{stats.lowStock}</div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-rose-400 bg-rose-500/10 w-fit px-2 py-1 rounded-md border border-rose-500/10">
              Perlu restok segera
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Transaksi Terakhir</h2>
          <button className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors">Lihat Semua</button>
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
              {stats.recentTransactions.map((tx) => (
                <tr key={tx.id} className="table-row">
                  <td className="px-8 py-5 text-slate-500 font-mono text-xs">
                    {format(new Date(tx.date), 'dd MMM yyyy HH:mm', { locale: id })}
                  </td>
                  <td className="px-8 py-5 font-semibold text-slate-100">{tx.item_name}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
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
              {stats.recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-500 italic">
                    Belum ada aktivitas transaksi tercatat.
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

export default Dashboard;
