'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ShoppingCart, Plus, Clock, CheckCircle2, XCircle, Search, Tag, Calendar } from 'lucide-react';

interface LoanItem {
  id: number;
  item_name?: string;
  type?: string;
  status?: string;
  created_at: string;
}

interface AtkItem {
  id: number;
  name: string;
}

export default function UserLoansPage() {
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [atkList, setAtkList] = useState<AtkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State Modal Pengajuan Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState('Asset'); // 'Asset' atau 'ATK'
  const [formBorrowerName, setFormBorrowerName] = useState('');
  const [formAssetId, setFormAssetId] = useState('1');
  const [formAtkId, setFormAtkId] = useState('1'); // ID ATK yang dipilih
  const [formQuantity, setFormQuantity] = useState('1');
  const [formReason, setFormReason] = useState('');

  // Fetch Data Peminjaman & Daftar ATK
  const fetchLoans = async () => {
    try {
      setLoading(true);
      const resLoans = await fetch('http://127.0.0.1:8000/api/loans', {
        headers: { 'Accept': 'application/json' },
      });
      const dataLoans = resLoans.ok ? await resLoans.json() : [];
      const assetLoans = Array.isArray(dataLoans) ? dataLoans : dataLoans.data || [];

      const formattedAssets = assetLoans.map((item: any) => ({
        id: item.id,
        item_name: item.asset?.name || `Aset ID: ${item.asset_id || item.id}`,
        type: 'Asset',
        status: item.status || 'pending',
        created_at: item.created_at ? item.created_at.slice(0, 10) : 'Baru saja',
      }));

      setLoans(formattedAssets);

      // Ambil daftar master ATK untuk pilihan dropdown
      const resAtk = await fetch('http://127.0.0.1:8000/api/atks', {
        headers: { 'Accept': 'application/json' },
      });
      const dataAtk = resAtk.ok ? await resAtk.json() : [];
      const rawAtkData = Array.isArray(dataAtk) ? dataAtk : dataAtk.data || [];
      setAtkList(rawAtkData);

      if (rawAtkData.length > 0) {
        setFormAtkId(String(rawAtkData[0].id));
      }

    } catch (err: any) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // Handle Submit Pengajuan Baru
  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = '';
      let payload = {};

      if (formCategory === 'Asset') {
        endpoint = 'http://127.0.0.1:8000/api/loans';
        payload = {
          borrower_name: formBorrowerName,
          asset_id: parseInt(formAssetId),
          loan_date: new Date().toISOString().slice(0, 10),
          reason: formReason,
        };
      } else {
        // DI SINI BAGIAN UTAMA YANG DIGANTI: Mengarah ke /api/atk-requests agar tampil di halaman Admin
        endpoint = 'http://127.0.0.1:8000/api/atk-requests';
        payload = {
          borrower_name: formBorrowerName, // Agar nama pemohon muncul di tabel admin
          atk_id: parseInt(formAtkId),
          quantity: parseInt(formQuantity),
          notes: formReason,
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Gagal mengirim pengajuan');
        throw new Error(errorMsg);
      }

      toast.success('Pengajuan berhasil dikirim!');
      setIsModalOpen(false);
      setFormBorrowerName('');
      setFormReason('');
      fetchLoans();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem');
    }
  };

  const filteredLoans = loans.filter((item) =>
    (item.item_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50/50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="text-purple-600" size={22} /> Riwayat Peminjaman & ATK
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Daftar barang kantor yang sedang Anda ajukan atau pinjam.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-purple-600/20 shrink-0"
          >
            <Plus size={16} /> Ajukan Barang Baru
          </button>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-4">Nama Barang / Aset</th>
                <th className="py-4 px-4">Jenis</th>
                <th className="py-4 px-4">Tanggal Pengajuan</th>
                <th className="py-4 px-4">Status Persetujuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">Memuat data riwayat...</td></tr>
              ) : filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{loan.item_name}</td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        <Tag size={11} /> {loan.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium flex items-center gap-1.5 pt-4.5">
                      <Calendar size={13} className="text-slate-400" /> {loan.created_at}
                    </td>
                    <td className="py-4 px-4">
                      {loan.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} /> Menunggu Persetujuan
                        </span>
                      )}
                      {loan.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} /> Disetujui
                        </span>
                      )}
                      {loan.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle size={12} /> Ditolak
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400">Belum ada riwayat pengajuan barang.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PENGAJUAN BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900 mb-1">Form Pengajuan Barang / ATK</h3>
            <p className="text-xs text-slate-500 mb-5">Pilih kategori dan masukkan detail barang yang ingin diajukan.</p>
            
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Peminjam / Pemohon</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap Anda"
                  value={formBorrowerName}
                  onChange={(e) => setFormBorrowerName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kategori Pengajuan</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                >
                  <option value="Asset">Peminjaman Aset (Perangkat / Elektronik)</option>
                  <option value="ATK">Permintaan ATK (Alat Tulis Kantor)</option>
                </select>
              </div>

              {formCategory === 'Asset' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">ID / Nomor Aset</label>
                  <input
                    type="number"
                    required
                    placeholder="Masukkan ID Aset (contoh: 1)"
                    value={formAssetId}
                    onChange={(e) => setFormAssetId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Pilih Barang ATK</label>
                    <select
                      value={formAtkId}
                      onChange={(e) => setFormAtkId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                    >
                      {atkList.length > 0 ? (
                        atkList.map((atk) => (
                          <option key={atk.id} value={atk.id}>
                            {atk.name} (ID: {atk.id})
                          </option>
                        ))
                      ) : (
                        <option value="1">Kertas HVS / ATK Default (ID: 1)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jumlah (Quantity)</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Keperluan / Keterangan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Digunakan untuk keperluan operasional kantor."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                />
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
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}