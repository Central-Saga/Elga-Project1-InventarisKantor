'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Box, Search, Plus, X } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  code?: string;
  asset_code?: string;
  category?: { name: string };
  condition: string;
  status: 'available' | 'borrowed' | 'maintenance';
}

interface Category {
  id: number;
  name: string;
}

export default function AdminStockAssetPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    asset_code: '', name: '', brand: '', category_id: '', condition: 'good',
    status: 'available', purchase_date: '', purchase_price: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://127.0.0.1:8000/api/v1/assets', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!res.ok) throw new Error('Gagal memuat data aset');
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    const token = localStorage.getItem('token');
    fetch('http://127.0.0.1:8000/api/v1/categories', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    }).then((res) => res.json()).then((data) => {
      setCategories(Array.isArray(data) ? data : data.data || []);
    }).catch(() => undefined);
  }, []);

  const handleCreateAsset = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/assets', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...form,
          category_id: Number(form.category_id),
          purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || Object.values(data.errors || {}).flat().join(', ') || 'Gagal menambahkan aset');
      toast.success('Aset berhasil ditambahkan.');
      setIsModalOpen(false);
      setForm({ asset_code: '', name: '', brand: '', category_id: '', condition: 'good', status: 'available', purchase_date: '', purchase_price: '' });
      fetchAssets();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan aset');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const name = asset?.name ?? '';
    const code = asset?.asset_code ?? asset?.code ?? '';
    const query = searchTerm.toLowerCase();

    return name.toLowerCase().includes(query) || code.toLowerCase().includes(query);
  });

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Box className="text-indigo-600" size={22} /> Stock Aset Kantor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Pantau ketersediaan, kondisi, dan status fisik aset inventaris kantor.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari aset atau kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            <Plus size={15} /> Tambah Aset
          </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-4">Kode</th>
                <th className="py-4 px-4">Nama Aset</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4">Kondisi</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">Memuat data aset...</td>
                </tr>
              ) : filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-600">{asset.asset_code || asset.code}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{asset.name}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{asset.category?.name || '-'}</td>
                    <td className="py-4 px-4 text-slate-700 font-medium">{asset.condition || 'Baik'}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        asset.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {asset.status === 'available' ? 'Tersedia' : 'Dipinjam'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">Tidak ada aset ditemukan.</td>
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
              <h2 className="text-base font-black text-slate-900">Tambah Aset Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAsset} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Kode aset" value={form.asset_code} onChange={(e) => setForm({ ...form, asset_code: e.target.value })} className="input" />
              <input required placeholder="Nama aset" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              <input placeholder="Merek" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" />
              <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                <option value="">Pilih kategori</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="input"><option value="good">Baik</option><option value="fair">Cukup</option><option value="poor">Rusak</option></select>
              <input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} className="input" />
              <input type="number" min="0" placeholder="Harga beli" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} className="input" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input"><option value="available">Tersedia</option><option value="maintenance">Perawatan</option></select>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Batal</button>
                <button disabled={submitting} type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:opacity-50">{submitting ? 'Menyimpan...' : 'Simpan Aset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}