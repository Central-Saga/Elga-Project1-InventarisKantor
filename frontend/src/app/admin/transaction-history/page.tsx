'use client';

import { useEffect, useState } from 'react';
import { History, Search, Package, Boxes, CalendarDays, FileText } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

interface HistoryItem {
  id: string;
  category: 'ATK' | 'Aset';
  action: string;
  item_name: string;
  item_code?: string;
  person?: string | null;
  quantity: number;
  unit?: string | null;
  transaction_date?: string | null;
  expected_return_date?: string | null;
  return_date?: string | null;
  status: string;
  notes?: string | null;
}

type HistoryFilter = 'all' | 'ATK' | 'Aset';

const API_URL = 'http://127.0.0.1:8000/api/v1/transaction-history';

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function statusLabel(item: HistoryItem): string {
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    borrowed: 'Dipinjam',
    return_requested: 'Menunggu Kembali',
    returned: 'Dikembalikan',
    in: 'Stok Masuk',
    out: 'Stok Keluar',
  };
  return labels[item.status] || item.status;
}

function statusClass(status: string): string {
  if (['approved', 'returned', 'in'].includes(status)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (['rejected', 'out'].includes(status)) return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

export default function AdminTransactionHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<HistoryFilter>('all');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token')}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal memuat riwayat transaksi');
        setItems(data.data || []);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat riwayat transaksi');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredItems = items.filter((item) => {
    const query = searchTerm.toLowerCase();
    const matchesCategory = category === 'all' || item.category === category;
    const matchesSearch = [item.item_name, item.item_code, item.person, item.notes]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mb-8 flex flex-col gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <History className="text-indigo-600" size={22} /> Riwayat Transaksi
            </h1>
            <p className="text-xs text-slate-500 mt-1">Lacak pergerakan ATK dan aset, peminjam, tanggal, status, serta keterangan penggunaan.</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="search"
              placeholder="Cari item, peminjam, keterangan..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'ATK', 'Aset'] as HistoryFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setCategory(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${category === filter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {filter === 'all' ? 'Semua' : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-4">Jenis / Aktivitas</th>
                <th className="py-4 px-4">Item</th>
                <th className="py-4 px-4">Peminjam / Penerima</th>
                <th className="py-4 px-4">Jumlah</th>
                <th className="py-4 px-4">Tanggal Ambil</th>
                <th className="py-4 px-4">Rencana Kembali</th>
                <th className="py-4 px-4">Tanggal Kembali</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-slate-400">Memuat riwayat transaksi...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-slate-400">Tidak ada riwayat transaksi ditemukan.</td></tr>
              ) : filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 align-top">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      {item.category === 'ATK' ? <Package size={15} className="text-indigo-500" /> : <Boxes size={15} className="text-blue-500" />}
                      {item.category}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{item.action}</p>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800">
                    {item.item_name}
                    <p className="font-mono text-[10px] text-slate-400 mt-1">{item.item_code || '-'}</p>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700">{item.person || '-'}</td>
                  <td className="py-4 px-4 font-extrabold text-slate-800">{item.quantity} <span className="font-normal text-slate-400">{item.unit || ''}</span></td>
                  <td className="py-4 px-4 text-slate-600"><span className="inline-flex items-center gap-1"><CalendarDays size={13} />{formatDate(item.transaction_date)}</span></td>
                  <td className="py-4 px-4 text-slate-600">{formatDate(item.expected_return_date)}</td>
                  <td className="py-4 px-4 text-slate-600">{formatDate(item.return_date)}</td>
                  <td className="py-4 px-4"><span className={`inline-flex whitespace-nowrap px-2.5 py-1 rounded-full border text-[10px] font-bold ${statusClass(item.status)}`}>{statusLabel(item)}</span></td>
                  <td className="py-4 px-4 max-w-[190px] text-slate-500"><span className="inline-flex gap-1"><FileText size={13} className="shrink-0 mt-0.5" />{item.notes || '-'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}