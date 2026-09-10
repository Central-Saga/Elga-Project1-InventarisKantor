'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { Plus, ArrowLeft, ArrowRight, AlertCircle, Calendar, FileText, User, Box } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  asset_code: string;
  status: string;
}

interface Loan {
  id: number;
  borrower_name: string;
  asset_id: number;
  loan_date: string;
  expected_return_date?: string | null;
  status: 'borrowed' | 'returned';
  notes?: string;
  asset?: Asset;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    borrower_name: '',
    asset_id: '',
    loan_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    notes: '',
  });

  // Fungsi fetch langsung pakai fetch standard ke port 8000 (Menghindari masalah helper API tersembunyi)
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resLoans, resAssets] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/loans', { headers: { 'Accept': 'application/json' } }),
        fetch('http://127.0.0.1:8000/api/assets', { headers: { 'Accept': 'application/json' } }),
      ]);

      if (!resLoans.ok || !resAssets.ok) {
        throw new Error('Gagal terhubung ke server backend Laravel.');
      }

      const loansData = await resLoans.json();
      const assetsData = await resAssets.json();

      setLoans(Array.isArray(loansData) ? loansData : loansData.data || []);
      const availableAssets = Array.isArray(assetsData) ? assetsData : assetsData.data || [];
      setAssets(availableAssets.filter((a: Asset) => a.status === 'available'));
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan koneksi.');
      toast.error('Gagal memuat data dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          asset_id: Number(formData.asset_id),
          borrower_name: formData.borrower_name,
          loan_date: formData.loan_date,
          expected_return_date: formData.expected_return_date,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan data.');
      }

      toast.success('Peminjaman aset berhasil disimpan!');
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan peminjaman');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm('Tandai aset ini sudah dikembalikan?')) return;
    
    const toastId = toast.loading('Memproses pengembalian...');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/loans/${id}/return`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Gagal memproses pengembalian');

      toast.success('Aset berhasil dikembalikan!', { id: toastId });
      loadData();
    } catch (err: any) {
      toast.error(`Gagal: ${err.message}`, { id: toastId });
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 text-xs">
            <Link href="/" className="text-gray-500 hover:text-emerald-600 transition flex items-center gap-1">
              <ArrowLeft size={14} /> Aset Utama
            </Link>
            <span className="text-gray-300">/</span>
            <Link href="/atk" className="text-gray-500 hover:text-emerald-600 transition flex items-center gap-1">
              Inventaris ATK <ArrowRight size={14} />
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Peminjaman Aset</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daftar Peminjaman Aset</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola sirkulasi peminjaman aset kantor dengan mudah dan transparan.</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              borrower_name: '',
              asset_id: '',
              loan_date: new Date().toISOString().split('T')[0],
              expected_return_date: '',
              notes: '',
            });
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 flex items-center gap-2 text-sm active:scale-95"
        >
          <Plus size={18} /> Pinjam Aset
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <span className="text-sm font-medium">{error} (Pastikan Laravel menyala di port 8000)</span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-4 px-6">Nama Peminjam</th>
                <th className="py-4 px-6">Aset Dipinjam</th>
                <th className="py-4 px-6">Tgl Pinjam</th>
                <th className="py-4 px-6">Rencana Kembali</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Memuat data peminjaman...</span>
                    </div>
                  </td>
                </tr>
              ) : loans.length > 0 ? (
                loans.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {item.borrower_name ? item.borrower_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      {item.borrower_name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-emerald-700">
                        {item.asset?.name || `ID Aset: ${item.asset_id}`}
                      </span>
                      {item.asset?.asset_code && (
                        <span className="block text-xs text-gray-400 font-mono">{item.asset.asset_code}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{item.loan_date}</td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{item.expected_return_date || '-'}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-bold ${
                          item.status === 'borrowed'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'borrowed' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        {item.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {item.status === 'borrowed' && (
                        <button
                          onClick={() => handleReturn(item.id)}
                          className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20 active:scale-95"
                        >
                          Kembalikan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Box size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-500">Belum ada riwayat peminjaman aset.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM PEMINJAMAN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><FileText size={20} /></span>
                Form Peminjaman Aset
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                  <User size={14} className="text-emerald-600" /> Nama Peminjam
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap peminjam"
                  value={formData.borrower_name}
                  onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                  <Box size={14} className="text-emerald-600" /> Pilih Aset Tersedia
                </label>
                <select
                  required
                  value={formData.asset_id}
                  onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition bg-white"
                >
                  <option value="">-- Pilih Aset Kantor --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.asset_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-emerald-600" /> Tanggal Pinjam
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.loan_date}
                    onChange={(e) => setFormData({ ...formData, loan_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-emerald-600" /> Rencana Kembali
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expected_return_date}
                    onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                  Keterangan / Keperluan (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Dipakai untuk instalasi jaringan"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pinjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}