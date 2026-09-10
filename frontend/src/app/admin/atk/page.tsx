'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Package, Search, Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AtkItem {
  id: number;
  name: string;
  item_code?: string;
  category?: string;
  stock?: number;
  min_stock?: number;
  unit?: string;
}

export default function AdminAtkPage() {
  const [atkList, setAtkList] = useState<AtkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    item_code: '',
    category: 'Alat Tulis & Kertas',
    stock: '',
    min_stock: '5',
    unit: 'Pcs',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAtkData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/atks', {
        headers: { 'Accept': 'application/json' },
      });
      const data = res.ok ? await res.json() : [];
      setAtkList(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      toast.error('Gagal memuat data inventaris ATK');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtkData();
  }, []);

  const handleCreateAtk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.stock === '' || formData.min_stock === '') {
      toast.error('Nama, stok, dan minimum stok wajib diisi!');
      return;
    }

    try {
      setSubmitting(true);
      const generatedCode = formData.item_code || `ATK-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const res = await fetch('http://127.0.0.1:8000/api/atks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          item_code: generatedCode, // Sesuai validasi Laravel: item_code
          category: formData.category, // Opsional jika database menerimanya
          stock: Number(formData.stock),
          min_stock: Number(formData.min_stock), // Sesuai validasi Laravel: min_stock
          unit: formData.unit,
        }),
      });

      if (res.ok) {
        toast.success('Berhasil menambahkan barang ATK baru!');
        setIsModalOpen(false);
        setFormData({ name: '', item_code: '', category: 'Alat Tulis & Kertas', stock: '', min_stock: '5', unit: 'Pcs' });
        fetchAtkData();
      } else {
        const errData = await res.json();
        const errorMsg = errData.errors 
          ? Object.values(errData.errors).flat().join(', ') 
          : (errData.message || 'Gagal menyimpan data ATK');
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi ke server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus item ATK ini dari sistem?')) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/atks/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        toast.success('Item ATK berhasil dihapus');
        fetchAtkData();
      } else {
        toast.error('Gagal menghapus item ATK');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
    }
  };

  const filteredAtk = atkList.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50/50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Package className="text-purple-600" size={22} /> Stock Alat Tulis Kantor (ATK)
          </h1>
          <p className="text-xs text-slate-500">Kelola database inventaris, kode barang, kategori, dan sisa stok fisik.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama, kode, kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            <Plus size={16} /> Tambah ATK
          </button>
        </div>
      </div>

      {/* Tabel Data ATK */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-6">Nama Barang</th>
                <th className="py-4 px-6">Kode (Item Code)</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Sisa Stok</th>
                <th className="py-4 px-6">Status Ketersediaan</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Memuat data inventaris ATK...</td>
                </tr>
              ) : filteredAtk.length > 0 ? (
                filteredAtk.map((item) => {
                  const stock = item.stock ?? 0;
                  const minStock = item.min_stock ?? 5;
                  const initialLetter = item.name ? item.name.charAt(0).toUpperCase() : 'A';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 font-black flex items-center justify-center text-xs shrink-0 border border-purple-100">
                          {initialLetter}
                        </div>
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-600 font-mono">
                        {item.item_code}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                          🏷️ {item.category || 'Alat Tulis & Kertas'}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-800">
                        {stock} {item.unit || 'Pcs'}
                      </td>

                      <td className="py-4 px-6">
                        {stock <= minStock ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle size={12} /> Stok Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Tersedia
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center justify-center"
                          title="Hapus Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Tidak ada data ATK yang ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah ATK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-purple-600" /> Tambah Barang ATK Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAtk} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Barang ATK</label>
                <input
                  type="text"
                  placeholder="Contoh: Kertas HVS 80gsm SIDU"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Code (Kode Barang)</label>
                <input
                  type="text"
                  placeholder="Contoh: ATK-001 (Kosongkan untuk otomatis)"
                  value={formData.item_code}
                  onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                >
                  <option value="Alat Tulis & Kertas">Alat Tulis & Kertas</option>
                  <option value="Perlengkapan Kantor">Perlengkapan Kantor</option>
                  <option value="Tinta & Printer">Tinta & Printer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min. Stok (Peringatan)</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Satuan</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                >
                  <option value="Pcs">Pcs</option>
                  <option value="Rim">Rim</option>
                  <option value="Box">Box</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Barang ATK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}