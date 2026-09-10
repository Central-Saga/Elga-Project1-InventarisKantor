'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle2, Clock, FileText, Search, XCircle } from 'lucide-react';

interface AtkRequest {
  id: number;
  requester_name: string;
  atk_item_name?: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function AdminAtkRequestPage() {
  const [requests, setRequests] = useState<AtkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/atk-requests', {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Gagal memuat data permintaan ATK');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    const actionName = status === 'approved' ? 'menyetujui' : 'menolak';
    if (!confirm(`Apakah Anda yakin ingin ${actionName} permintaan ATK ini?`)) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/atk-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Gagal memperbarui status permintaan');

      toast.success(`Permintaan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}!`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat memproses');
    }
  };

  // Safe filtering untuk mencegah error toLowerCase dari data null/undefined
  const filteredRequests = requests.filter((req) => {
    const requester = req?.requester_name ?? '';
    const itemName = req?.atk_item_name ?? '';
    const query = searchTerm.toLowerCase();

    return (
      requester.toLowerCase().includes(query) ||
      itemName.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header Halaman */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-indigo-600" size={22} /> Permintaan ATK
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola dan verifikasi pengajuan persediaan alat tulis kantor dari karyawan.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari pemohon atau barang ATK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Tabel Data Permintaan ATK */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-4">Pemohon</th>
                <th className="py-4 px-4">Item ATK</th>
                <th className="py-4 px-4">Jumlah</th>
                <th className="py-4 px-4">Tanggal Pengajuan</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Memuat data permintaan...</td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                        {req.requester_name ? req.requester_name.charAt(0).toUpperCase() : '?'}
                      </div>
                      {req.requester_name || 'Tanpa Nama'}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {req.atk_item_name || 'Item ATK ID: ' + req.id}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-700">
                      {req.quantity} <span className="text-[10px] text-slate-400 font-normal">Pcs</span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{req.created_at || '-'}</td>
                    <td className="py-4 px-4">
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} /> Menunggu
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Disetujui
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle size={12} /> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-[11px]"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-colors text-[11px]"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">Selesai Diproses</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Tidak ada riwayat permintaan ATK ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}