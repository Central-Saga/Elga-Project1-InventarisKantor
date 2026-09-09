'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

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
  return_date?: string | null;
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

  // Form State dengan Tanggal Pinjam & Rencana Kembali
  const [formData, setFormData] = useState({
    borrower_name: '',
    asset_id: '',
    loan_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      const [loansData, assetsData] = await Promise.all([
        fetchAPI<Loan[]>('loans'),
        fetchAPI<Asset[]>('assets'),
      ]);
      setLoans(loansData);
      setAssets(assetsData.filter((a) => a.status === 'available'));
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data peminjaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = () => {
    setFormData({
      borrower_name: '',
      asset_id: '',
      loan_date: new Date().toISOString().split('T')[0],
      expected_return_date: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchAPI('loans', {
        method: 'POST',
        body: JSON.stringify({
          asset_id: Number(formData.asset_id),
          borrower_name: formData.borrower_name,
          loan_date: formData.loan_date,
          expected_return_date: formData.expected_return_date,
          notes: formData.notes,
        }),
      });
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Gagal menyimpan peminjaman: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm('Tandai aset ini sudah dikembalikan?')) return;
    try {
      await fetchAPI(`loans/${id}/return`, { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert(`Gagal memproses pengembalian: ${err.message}`);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="mb-6 flex justify-between items-center border-b pb-4">
        <div>
          <div className="flex gap-4 mb-2">
            <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition">
              ← Aset Utama
            </Link>
            <Link href="/atk" className="text-sm text-gray-500 hover:text-blue-600 transition">
              → Inventaris ATK
            </Link>
            <span className="text-sm font-bold text-blue-600">• Peminjaman Aset</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Peminjaman Aset</h1>
        </div>

        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm text-sm"
        >
          + Pinjam Aset
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-t text-gray-700 uppercase text-xs tracking-wider">
                <th className="py-3 px-4 font-semibold">Nama Peminjam</th>
                <th className="py-3 px-4 font-semibold">Aset</th>
                <th className="py-3 px-4 font-semibold">Tgl Pinjam</th>
                <th className="py-3 px-4 font-semibold">Rencana Kembali</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Memuat data peminjaman...
                  </td>
                </tr>
              ) : loans.length > 0 ? (
                loans.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {item.borrower_name}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">
                      {item.asset?.name || `ID Aset: ${item.asset_id}`}
                    </td>
                    <td className="py-3.5 px-4">{item.loan_date}</td>
                    <td className="py-3.5 px-4">{item.expected_return_date || '-'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                          item.status === 'borrowed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'borrowed' && (
                        <button
                          onClick={() => handleReturn(item.id)}
                          className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Kembalikan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Belum ada riwayat peminjaman.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM PEMINJAMAN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Form Peminjaman Aset Kantor
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nama Peminjam
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama peminjam"
                  value={formData.borrower_name}
                  onChange={(e) =>
                    setFormData({ ...formData, borrower_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Pilih Aset (Tersedia)
                </label>
                <select
                  required
                  value={formData.asset_id}
                  onChange={(e) =>
                    setFormData({ ...formData, asset_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="">-- Pilih Aset --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.asset_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Tanggal Pinjam
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.loan_date}
                    onChange={(e) =>
                      setFormData({ ...formData, loan_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Rencana Kembali
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expected_return_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expected_return_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Keterangan / Keperluan
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Dipakai untuk kerja lapangan di unit B"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
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