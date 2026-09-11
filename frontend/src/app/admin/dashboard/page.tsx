'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { LayoutDashboard, Package, ShoppingCart, AlertTriangle, ArrowUpRight, RefreshCw, CalendarClock, Plus, X } from 'lucide-react';

interface AtkItem {
  id: number;
  name: string;
  stock?: number;
  quantity?: number;
  unit?: string;
}

interface LoanItem {
  id: number;
  borrower_name?: string;
  item_name?: string;
  asset?: { name: string };
  return_date?: string;
  expected_return_date?: string;
  due_date?: string;
  status?: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalAtk: 0,
    pendingLoans: 0,
    activeLoans: 0,
  });

  const [atkStockList, setAtkStockList] = useState<AtkItem[]>([]);
  const [upcomingReturns, setUpcomingReturns] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Tambah / Input Stok ATK
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    stock: '',
    unit: 'Pcs',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch ringkasan data, stok ATK, & jadwal pengembalian
  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // 1. Ambil data Aset
      const resAssets = await fetch('http://127.0.0.1:8000/api/v1/assets', { headers });
      const dataAssets = resAssets.ok ? await resAssets.json() : [];
      const assetsCount = Array.isArray(dataAssets) ? dataAssets.length : (dataAssets.data?.length || 0);

      // 2. Ambil data Master ATK
      const resAtk = await fetch('http://127.0.0.1:8000/api/v1/atks', { headers });
      const dataAtk = resAtk.ok ? await resAtk.json() : [];
      const atkItems = Array.isArray(dataAtk) ? dataAtk : (dataAtk.data || []);
      setAtkStockList(atkItems);

      // 3. Ambil data Peminjaman Aset
      const resLoans = await fetch('http://127.0.0.1:8000/api/v1/loans', { headers });
      const dataLoans = resLoans.ok ? await resLoans.json() : [];
      const loans = Array.isArray(dataLoans) ? dataLoans : (dataLoans.data || []);
      
      const pendingCount = loans.filter((l: any) => l.status === 'pending').length;
      const activeLoansList = loans.filter((l: any) => l.status === 'approved' || l.status === 'borrowed');

      setStats({
        totalAssets: assetsCount,
        totalAtk: atkItems.length,
        pendingLoans: pendingCount,
        activeLoans: activeLoansList.length,
      });

      setUpcomingReturns(activeLoansList.slice(0, 5));

    } catch (err: any) {
      toast.error('Gagal memuat data dashboard admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboardData();
    const refreshTimer = window.setInterval(fetchAdminDashboardData, 5000);

    return () => window.clearInterval(refreshTimer);
  }, []);

  // Handle Submit Tambah ATK Baru
  const handleCreateAtk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.stock) {
      toast.error('Nama barang dan jumlah stok wajib diisi!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('http://127.0.0.1:8000/api/v1/atks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          item_code: formData.item_code,
          name: formData.name,
          stock: Number(formData.stock),
          unit: formData.unit,
          min_stock: 5,
        }),
      });

      if (res.ok) {
        toast.success('Berhasil menambahkan barang ATK baru!');
        setIsModalOpen(false);
        setFormData({ item_code: '', name: '', stock: '', unit: 'Pcs' });
        fetchAdminDashboardData(); // Refresh data dashboard
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Gagal menyimpan data ATK');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi ke server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50/50 min-h-screen relative">
      <Toaster position="top-right" />

      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="text-purple-600" size={22} /> Dashboard Admin Inventaris
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Ringkasan sistem peminjaman aset dan kontrol stok ATK kantor.</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-200 transition-colors"
          >
            <Plus size={15} /> Tambah / Input ATK
          </button>
          <button
            onClick={fetchAdminDashboardData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Muat Ulang
          </button>
        </div>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Jenis ATK</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalAtk} Item</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingCart size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Aset Kantor</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalAssets} Unit</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pengajuan Pending</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.pendingLoans} Permintaan</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowUpRight size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sedang Dipinjam</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.activeLoans} Aset</h3>
          </div>
        </div>
      </div>

      {/* GRID DUA KOLOM: PANTAUAN PENGEMBALIAN & STOK ATK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom 1: Pantauan Pengembalian Terdekat */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CalendarClock className="text-purple-600" size={18} /> Pengembalian Aset Terdekat
              </h3>
              <p className="text-xs text-slate-500">Daftar aset pinjaman aktif yang mendekati tenggat waktu pengembalian.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Peminjam</th>
                  <th className="py-3 px-3">Aset</th>
                  <th className="py-3 px-3">Jadwal Kembali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400">Memuat data pengembalian...</td></tr>
                ) : upcomingReturns.length > 0 ? (
                  upcomingReturns.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{loan.borrower_name || 'Karyawan'}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-700">{loan.asset?.name || loan.item_name || 'Aset Kantor'}</td>
                      <td className="py-3.5 px-3 font-semibold text-purple-600">
                        {loan.expected_return_date || loan.due_date || loan.return_date || 'Segera'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400">Tidak ada jadwal pengembalian mendesak.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom 2: Monitoring Stok ATK */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900">Monitoring Stok Alat Tulis Kantor (ATK)</h3>
              <p className="text-xs text-slate-500">Daftar sisa stok fisik barang ATK yang tersedia di inventaris.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <Plus size={14} /> Input Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">Nama Barang</th>
                  <th className="py-3 px-3">Sisa Stok</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400">Memuat stok ATK...</td></tr>
                ) : atkStockList.length > 0 ? (
                  atkStockList.slice(0, 5).map((atk) => {
                    const currentStock = atk.stock ?? atk.quantity ?? 0;
                    return (
                      <tr key={atk.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-3 font-bold text-slate-900">{atk.name}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700">{currentStock} {atk.unit || 'Pcs'}</td>
                        <td className="py-3.5 px-3">
                          {currentStock <= 5 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Menipis
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Tersedia
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={3} className="text-center py-8 text-slate-400">Belum ada data master ATK.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL INPUT / TAMBAH ATK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-purple-600" /> Tambah / Input Barang ATK Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAtk} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode ATK</label>
                <input
                  type="text"
                  placeholder="Contoh: ATK-2026-003"
                  value={formData.item_code}
                  onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Barang ATK</label>
                <input
                  type="text"
                  placeholder="Contoh: Kertas HVS A4, Pulpen Hitam"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Stok Awal</label>
                <input
                  type="number"
                  placeholder="Contoh: 50"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  required
                />
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
                  <option value="Unit">Unit</option>
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