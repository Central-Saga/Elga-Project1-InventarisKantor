'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowLeftRight, CheckCircle2, Clock, Search, XCircle } from 'lucide-react';
import { TableState } from '@/components/TableState';
import { formatDate } from '@/lib/schemas';

interface Loan {
  id: number;
  borrower_name: string;
  asset_name?: string;
  loan_date: string;
  expected_return_date?: string;
  return_date?: string;
  user_role?: string;
  status: 'pending' | 'approved' | 'rejected' | 'borrowed' | 'return_requested' | 'returned' | 'late';
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');

      const res = await fetch('http://127.0.0.1:8000/api/v1/loans', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!res.ok) throw new Error('Gagal memuat data peminjaman');
      const data = await res.json();
      const rawLoans = Array.isArray(data) ? data : data.data || [];
      setLoans(rawLoans.map((loan: Loan & { asset?: { name?: string }; asset_id?: number; user?: { role?: string } }) => ({
        ...loan,
        asset_name: loan.asset?.name || loan.asset_name || `Aset ID: ${loan.asset_id}`,
        user_role: loan.user?.role,
      })));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturn = async (id: number) => {
    if (!confirm('Apakah Anda yakin aset ini sudah dikembalikan?')) return;

    try {
      if (processingId !== null) return;
      setProcessingId(id);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');

      const res = await fetch(`http://127.0.0.1:8000/api/v1/loans/${id}/return`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ return_condition: 'good' }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(', ')
          : null;
        throw new Error(data.message || validationMessage || `Gagal memproses pengembalian aset (${res.status})`);
      }

      toast.success('Aset berhasil dikembalikan!');
      fetchLoans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      if (processingId !== null) return;
      setProcessingId(id);
      const res = await fetch(`http://127.0.0.1:8000/api/v1/loans/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui status permintaan');

      toast.success(status === 'approved' ? 'Permintaan disetujui.' : 'Permintaan ditolak.');
      fetchLoans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses permintaan');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const borrower = loan?.borrower_name ?? '';
    const asset = loan?.asset_name ?? '';
    const query = searchTerm.toLowerCase();

    return borrower.toLowerCase().includes(query) || asset.toLowerCase().includes(query);
  });

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="text-indigo-600" size={22} /> Manajemen Peminjaman Aset
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola sirkulasi peminjaman dan verifikasi pengembalian inventaris kantor.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari peminjam atau aset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-4">Peminjam</th>
                <th className="py-4 px-4">Aset Dipinjam</th>
                <th className="py-4 px-4">Tanggal Pinjam</th>
                <th className="py-4 px-4">Rencana Kembali</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableState colSpan={6} loading empty={false} emptyLabel="" />
              ) : filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{loan.borrower_name || 'Tanpa Nama'}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{loan.asset_name || 'Aset ID: ' + loan.id}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{formatDate(loan.loan_date)}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{formatDate(loan.expected_return_date || loan.return_date)}</td>
                    <td className="py-4 px-4">
                      {loan.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} /> Menunggu Persetujuan
                        </span>
                      )}
                      {loan.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          <CheckCircle2 size={12} /> Disetujui
                        </span>
                      )}
                      {loan.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle size={12} /> Ditolak
                        </span>
                      )}
                      {loan.status === 'borrowed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} /> Dipinjam
                        </span>
                      )}
                      {loan.status === 'return_requested' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Clock size={12} /> Menunggu Konfirmasi Pengembalian
                        </span>
                      )}
                      {loan.status === 'returned' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Dikembalikan
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {loan.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(loan.id, 'approved')}
                            disabled={processingId !== null}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors text-[11px]"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(loan.id, 'rejected')}
                            disabled={processingId !== null}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors text-[11px]"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : loan.status === 'return_requested' || (loan.user_role === 'admin' && (loan.status === 'approved' || loan.status === 'borrowed')) ? (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          disabled={processingId !== null}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm text-[11px]"
                        >
                          {loan.status === 'return_requested' ? 'Konfirmasi Pengembalian' : 'Kembalikan'}
                        </button>
                      ) : loan.status === 'approved' || loan.status === 'borrowed' ? (
                        <span className="text-slate-400 font-medium text-[11px]">Menunggu pengajuan user</span>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <TableState colSpan={6} loading={false} empty emptyLabel="Tidak ada riwayat peminjaman ditemukan." />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}