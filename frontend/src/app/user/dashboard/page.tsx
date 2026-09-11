'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Boxes, FileText, Clock, CheckCircle2, ArrowRight, ShieldAlert, PlusCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface DueSoonLoan {
  id: number;
  itemName: string;
  expectedReturnDate: string;
  daysRemaining: number;
}

export default function UserDashboardPage() {
  const [stats, setStats] = useState({
    activeLoans: 0,
    pendingRequests: 0,
    totalHistory: 0,
  });
  const [dueSoonLoans, setDueSoonLoans] = useState<DueSoonLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:8000/api/v1/loans', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) throw new Error('Gagal memuat ringkasan dashboard');
        const response = await res.json();
        const loans = Array.isArray(response) ? response : response.data || [];
        const atkRes = await fetch('http://127.0.0.1:8000/api/v1/atk-requests', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!atkRes.ok) throw new Error('Gagal memuat pengajuan ATK');
        const atkResponse = await atkRes.json();
        const atkRequests = Array.isArray(atkResponse) ? atkResponse : atkResponse.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingLoans = loans.flatMap((loan: any) => {
          if (!['approved', 'borrowed'].includes(loan.status) || !loan.expected_return_date) return [];

          const returnDate = new Date(`${loan.expected_return_date}T00:00:00`);
          const daysRemaining = Math.ceil((returnDate.getTime() - today.getTime()) / 86400000);
          if (daysRemaining > 3) return [];

          return [{
            id: loan.id,
            itemName: loan.asset?.name || `Aset ID: ${loan.asset_id}`,
            expectedReturnDate: loan.expected_return_date,
            daysRemaining,
          }];
        });
        setStats({
          activeLoans: loans.filter((loan: any) => loan.status === 'approved' || loan.status === 'borrowed').length,
          pendingRequests: loans.filter((loan: any) => loan.status === 'pending').length
            + atkRequests.filter((request: any) => request.status === 'pending').length,
          totalHistory: loans.length + atkRequests.length,
        });
        setDueSoonLoans(upcomingLoans);
      } catch (err: any) {
        setStats({ activeLoans: 0, pendingRequests: 0, totalHistory: 0 });
        setDueSoonLoans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const refreshTimer = window.setInterval(fetchDashboardData, 5000);

    return () => window.clearInterval(refreshTimer);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      <Toaster position="top-right" />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-purple-900/10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 backdrop-blur-md text-purple-200 border border-white/10 mb-4">
            <Boxes size={13} /> Portal Peminjam & ATK Kantor
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
            Selamat Datang di Sistem Inventaris
          </h1>
          <p className="text-xs md:text-sm text-purple-200/80 leading-relaxed mb-6">
            Ajukan peminjaman perangkat inventaris kantor atau permintaan alat tulis kantor (ATK) dengan mudah, cepat, dan pantau status persetujuannya secara *real-time*.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/user/loans"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <PlusCircle size={16} /> Buat Pengajuan Baru
            </Link>
          </div>
        </div>
        {/* Dekorasi Background */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Statistik Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/user/loans?filter=active" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-emerald-300 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Aset Dipinjam Aktif</p>
            <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : stats.activeLoans}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
          <ArrowRight size={16} className="text-slate-300" />
        </Link>

        <Link href="/user/loans?filter=pending" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-amber-300 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Menunggu Persetujuan</p>
            <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : stats.pendingRequests}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
          <ArrowRight size={16} className="text-slate-300" />
        </Link>

        <Link href="/user/loans?filter=history" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-purple-300 hover:shadow-md transition-all">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Riwayat Pengajuan</p>
            <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : stats.totalHistory}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText size={22} />
          </div>
          <ArrowRight size={16} className="text-slate-300" />
        </Link>
      </div>

      {dueSoonLoans.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={21} />
            <div className="w-full">
              <h3 className="text-sm font-black text-amber-900">Peringatan pengembalian aset</h3>
              <p className="text-xs text-amber-800 mt-1">Segera kembalikan aset berikut sesuai tanggal yang telah ditentukan.</p>
              <div className="mt-3 space-y-2">
                {dueSoonLoans.map((loan) => (
                  <div key={loan.id} className="flex flex-wrap items-center justify-between gap-2 bg-white/70 rounded-xl px-3 py-2 text-xs">
                    <span className="font-bold text-slate-800">{loan.itemName}</span>
                    <span className="font-semibold text-amber-700">
                      {loan.daysRemaining < 0 ? `Terlambat ${Math.abs(loan.daysRemaining)} hari` : loan.daysRemaining === 0 ? 'Jatuh tempo hari ini' : `${loan.daysRemaining} hari lagi`} ({loan.expectedReturnDate})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Card / Panduan Singkat */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="text-purple-600" size={18} /> Informasi Prosedur Peminjaman
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">1. Pilih Barang / ATK</span>
            Pastikan aset yang ingin dipinjam berstatus tersedia atau ajukan kebutuhan ATK kantor Anda.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">2. Tunggu Validasi Admin</span>
            Admin akan memeriksa ketersediaan dan menyetujui pengajuan Anda dalam sistem.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">3. Pengembalian Tepat Waktu</span>
            Jaga kondisi fisik aset yang dipinjam dan kembalikan sesuai batas waktu yang ditentukan.
          </div>
        </div>
      </div>
    </div>
  );
}