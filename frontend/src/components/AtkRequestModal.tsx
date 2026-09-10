  'use client';

  import { useState } from 'react';
  import { fetchAPI } from '@/lib/api';

  interface Atk {
    id: number;
    item_code: string;
    name: string;
    unit: string;
    stock: number;
  }

  interface Props {
    atks: Atk[];
    onSuccess: () => void;
  }

  export default function AtkRequestModal({ atks, onSuccess }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      borrower_name:'',
      atk_id: '',
      requester_name: '',
      quantity: 1,
      notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.atk_id) {
        alert('Pilih item ATK terlebih dahulu.');
        return;
      }

      setIsSubmitting(true);
      try {
        await fetchAPI('atk-requests', {
          method: 'POST',
          body: JSON.stringify({
            borrower_name: formData.requester_name,
            atk_id: Number(formData.atk_id),
            requester_name: formData.requester_name,
            quantity: Number(formData.quantity),
            notes: formData.notes,
          }),
        });

        alert('Pengajuan ATK berhasil dibuat!');
        setIsOpen(false);
        setFormData({ borrower_name: '',atk_id: '', requester_name: '', quantity: 1, notes: '' });
        onSuccess();
      } catch (err: any) {
        alert(`Gagal mengajukan: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm text-sm"
        >
          + Permintaan ATK
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Form Permintaan ATK
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Nama Pemohon
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama kamu"
                    value={formData.requester_name}
                    onChange={(e) =>
                      setFormData({ ...formData, requester_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Pilih Barang ATK
                  </label>
                  <select
                    required
                    value={formData.atk_id}
                    onChange={(e) =>
                      setFormData({ ...formData, atk_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Barang --</option>
                    {atks.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Sisa Stok: {item.stock} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Jumlah / Qty
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Catatan / Keperluan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Untuk kebutuhan meeting bulanan"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }