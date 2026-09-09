'use client';

import { useState } from 'react';
import { fetchAPI } from '@/lib/api';

interface Asset {
  id: number;
  asset_code: string;
  name: string;
  status: string;
}

interface Props {
  assets: Asset[];
  onSuccess: () => void;
}

export default function AssetLoanModal({ assets, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    asset_id: '',
    borrower_name: '',
    loan_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Filter hanya aset yang berstatus 'available'
  const availableAssets = assets.filter((a) => a.status === 'available');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset_id) {
      alert('Pilih aset yang ingin dipinjam.');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchAPI('loans', {
        method: 'POST',
        body: JSON.stringify({
          asset_id: Number(formData.asset_id),
          borrower_name: formData.borrower_name,
          loan_date: formData.loan_date,
          notes: formData.notes,
        }),
      });

      alert('Peminjaman aset berhasil dicatat!');
      setIsOpen(false);
      setFormData({
        asset_id: '',
        borrower_name: '',
        loan_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      onSuccess();
    } catch (err: any) {
      alert(`Gagal meminjam: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm text-sm"
      >
        + Pinjam Aset
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl text-left">
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
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Pilih Aset --</option>
                  {availableAssets.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.asset_code}] {item.name}
                    </option>
                  ))}
                </select>
                {availableAssets.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Tidak ada aset yang tersedia saat ini.
                  </p>
                )}
              </div>

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
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Keterangan / Keperluan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Dipakai untuk kerja lapangan di unit B"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableAssets.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Simpan Pinjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}