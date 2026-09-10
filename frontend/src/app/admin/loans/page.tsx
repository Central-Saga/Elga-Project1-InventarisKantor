'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowLeftRight, CheckCircle2, Clock, Search, UserCheck } from 'lucide-react';

interface Loan {
  id: number;
  borrower_name: string;
  asset_id: number;
  asset?: {
    name: string;
    asset_code: string;
  };
  loan_date: string;
  expected_return_date: string;
  status: 'borrowed' | 'returned';
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLoans = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/loans', {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Gagal memuat data peminjaman');
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturn = async (id: number) => {
    if (!confirm('Pastikan fisik aset sudah diperiksa dan diterima kembali dengan baik. Lanjutkan?')) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/loans/${id}/return`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Gagal memproses pengembalian aset');

      toast.success('Aset berhasil dikembalikan!');
      fetchLoans();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses pengembalian');
    }
  };

  const filteredLoans = loans.filter((loan) =>
    loan.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.asset?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header Halaman */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="text-emerald-600" size={22} /> Manajemen Peminjaman Aset
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola sirkulasi peminjaman dan verifikasi pengembalian inventaris kantor.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari peminjam atau aset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* Tabel Data Peminjaman */}
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
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Memuat data peminjaman...</td>
                </tr>
              ) : filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-xs shrink-0">
                        {loan.borrower_name.charAt(0).toUpperCase()}
                      </div>
                      {loan.borrower_name}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{loan.asset?.name || 'Aset ID: ' + loan.asset_id}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{loan.asset?.asset_code || '-'}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{loan.loan_date}</td>
                    <td className="py-4 px-4 text-amber-600 font-bold">{loan.expected_return_date}</td>
                    <td className="py-4 px-4">
                      {loan.status === 'borrowed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} /> Dipinjam
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Dikembalikan
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {loan.status === 'borrowed' ? (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm text-[11px]"
                        >
                          Terima Kembali
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Tidak ada riwayat peminjaman ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}