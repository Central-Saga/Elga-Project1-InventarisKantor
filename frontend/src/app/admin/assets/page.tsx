'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Boxes, Plus, Search, ShieldCheck, Tag, Trash2, AlertCircle } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  asset_code: string;
  category?: any;
  status: 'available' | 'borrowed' | 'maintenance';
  condition: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk modal & form input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formCondition, setFormCondition] = useState('good'); // Default disesuaikan ke 'good'
  const [formStatus, setFormStatus] = useState('available');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resAssets, resCats] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/assets', { headers: { 'Accept': 'application/json' } }),
        fetch('http://127.0.0.1:8000/api/categories', { headers: { 'Accept': 'application/json' } }).catch(() => null)
      ]);

      if (!resAssets.ok) throw new Error('Gagal memuat data aset');
      const assetData = await resAssets.json();
      setAssets(Array.isArray(assetData) ? assetData : assetData.data || []);

      if (resCats && resCats.ok) {
        const catData = await resCats.json();
        setCategories(Array.isArray(catData) ? catData : catData.data || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/assets', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          asset_code: formCode,
          category_id: Number(formCategoryId),
          condition: formCondition,
          status: formStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || JSON.stringify(data.errors) || 'Gagal menambahkan aset baru';
        throw new Error(errorMsg);
      }

      toast.success('Aset berhasil ditambahkan!');
      setIsModalOpen(false);
      setFormName('');
      setFormCode('');
      setFormCategoryId('');
      setFormCondition('good');
      setFormStatus('available');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data');
    }
  };

  const handleDeleteAsset = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aset ini dari sistem?')) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/assets/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Gagal menghapus aset');

      toast.success('Aset berhasil dihapus');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus data');
    }
  };

  const getCategoryName = (category: any) => {
    if (!category) return 'Umum';
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      return category.name || category.title || 'Umum';
    }
    return String(category);
  };

  const filteredAssets = assets.filter((item) => {
    const name = item?.name ?? '';
    const code = item?.asset_code ?? '';
    const categoryStr = getCategoryName(item?.category);
    const query = searchTerm.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      code.toLowerCase().includes(query) ||
      categoryStr.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header Halaman */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="text-purple-600" size={22} /> Stock Aset Kantor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola database inventaris, nomor seri, dan status ketersediaan barang.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama, kode, kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <Plus size={16} /> Tambah Aset
          </button>
        </div>
      </div>

      {/* Tabel Data Aset */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-4">Nama Aset</th>
                <th className="py-4 px-4">Kode / Serial</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4">Kondisi</th>
                <th className="py-4 px-4">Status Fisik</th>
                <th className="py-4 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Memuat data aset...</td>
                </tr>
              ) : filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-black flex items-center justify-center text-xs shrink-0">
                        {asset.name ? asset.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      {asset.name || 'Tanpa Nama'}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-600">
                      {asset.asset_code || '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        <Tag size={11} /> {getCategoryName(asset.category)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium uppercase text-[10px]">{asset.condition || '-'}</td>
                    <td className="py-4 px-4">
                      {(!asset.status || asset.status === 'available') && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck size={12} /> Tersedia
                        </span>
                      )}
                      {asset.status === 'borrowed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Boxes size={12} /> Dipinjam
                        </span>
                      )}
                      {asset.status === 'maintenance' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle size={12} /> Perawatan
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Hapus Aset"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Tidak ada data aset ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH ASET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900 mb-1">Tambah Aset Baru</h3>
            <p className="text-xs text-slate-500 mb-5">Masukkan informasi detail inventaris perangkat atau barang kantor.</p>
            
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Aset</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MacBook Pro M3 16 Inch"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kode / Nomor Seri Aset</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AST-2026-001"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kategori</label>
                <select
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kondisi</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                  >
                    <option value="good">Good (Baik)</option>
                    <option value="fair">Fair (Cukup)</option>
                    <option value="damaged">Damaged (Rusak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                  >
                    <option value="available">Tersedia</option>
                    <option value="maintenance">Perawatan</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-purple-600/20"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}