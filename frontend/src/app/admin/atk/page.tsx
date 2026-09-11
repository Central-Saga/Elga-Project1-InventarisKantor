'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { PackageCheck, Search, Plus, X } from 'lucide-react';

interface Atk {
  id: number;
  name: string;
  stock: number;
  unit: string;
}

export default function AdminStockAtkPage() {
  const [atks, setAtks] = useState<Atk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ item_code: '', name: '', stock: '', unit: 'Pcs', min_stock: '5' });

  const fetchAtks = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://127.0.0.1:8000/api/v1/atks', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!res.ok) throw new Error('Gagal memuat data stock ATK');
      const data = await res.json();
      setAtks(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtks();
  }, []);

  const handleCreateAtk = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/atks', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...form, stock: Number(form.stock), min_stock: Number(form.min_stock) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(', ') || 'Gagal menambahkan ATK');
      toast.success('ATK berhasil ditambahkan.');
      setIsModalOpen(false);
      setForm({ item_code: '', name: '', stock: '', unit: 'Pcs', min_stock: '5' });
      fetchAtks();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan ATK');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAtks = atks.filter((atk) => {
    const name = atk?.name ?? '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <PackageCheck className="text-indigo-600" size={22} /> Stock Alat Tulis Kantor (ATK)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola sisa stok dan ketersediaan barang ATK secara real-time.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari barang ATK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            <Plus size={15} /> Tambah ATK
          </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-4">Nama Barang</th>
                <th className="py-4 px-4">Jumlah Stok</th>
                <th className="py-4 px-4">Satuan</th>
                <th className="py-4 px-4">Status Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">Memuat data ATK...</td>
                </tr>
              ) : filteredAtks.length > 0 ? (
                filteredAtks.map((atk) => (
                  <tr key={atk.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{atk.name}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-800">{atk.stock}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{atk.unit || 'Pcs'}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        atk.stock > 5 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {atk.stock > 5 ? 'Stok Aman' : 'Stok Menipis'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">Tidak ada item ATK ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-slate-900">Tambah ATK Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAtk} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Kode ATK" value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} className="input" />
              <input required placeholder="Nama barang" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              <input required type="number" min="0" placeholder="Stok awal" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input"><option>Pcs</option><option>Box</option><option>Rim</option><option>Pack</option></select>
              <input required type="number" min="0" placeholder="Batas stok minimum" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} className="input" />
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Batal</button>
                <button disabled={submitting} type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:opacity-50">{submitting ? 'Menyimpan...' : 'Simpan ATK'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}