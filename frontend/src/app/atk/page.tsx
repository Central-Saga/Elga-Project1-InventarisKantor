'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import AtkRequestModal from '@/components/AtkRequestModal';

interface Atk {
  id: number;
  item_code: string;
  name: string;
  unit: string;
  stock: number;
  min_stock: number;
}

export default function AtkPage() {
  const [atks, setAtks] = useState<Atk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    unit: 'Pcs',
    stock: 0,
    min_stock: 5,
  });

  const loadData = async () => {
    try {
      const data = await fetchAPI<Atk[]>('atks');
      setAtks(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data ATK.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      item_code: '',
      name: '',
      unit: 'Pcs',
      stock: 0,
      min_stock: 5,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Atk) => {
    setEditingId(item.id);
    setFormData({
      item_code: item.item_code,
      name: item.name,
      unit: item.unit,
      stock: item.stock,
      min_stock: item.min_stock,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await fetchAPI(`atks/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchAPI('atks', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Gagal menyimpan data: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus item ATK ini?')) return;
    try {
      await fetchAPI(`atks/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
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
            <span className="text-sm font-bold text-blue-600">• Inventaris ATK</span>
            <Link href="/loans" className="text-sm text-gray-500 hover:text-blue-600 transition">
              → Peminjaman Aset
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Stok Alat Tulis Kantor (ATK)
          </h1>
        </div>

        <div className="flex gap-3 items-center">
          <AtkRequestModal atks={atks} onSuccess={loadData} />
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm text-sm"
          >
            + Tambah ATK
          </button>
        </div>
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
                <th className="py-3 px-4 font-semibold">Kode Item</th>
                <th className="py-3 px-4 font-semibold">Nama Barang</th>
                <th className="py-3 px-4 font-semibold">Satuan</th>
                <th className="py-3 px-4 font-semibold">Stok Saat Ini</th>
                <th className="py-3 px-4 font-semibold">Stok Min</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Memuat data ATK...
                  </td>
                </tr>
              ) : atks.length > 0 ? (
                atks.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-blue-600">
                      {item.item_code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4">{item.unit}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                          item.stock <= item.min_stock
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.stock} {item.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{item.min_stock}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Belum ada data ATK. Klik tombol Tambah ATK di atas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Data ATK' : 'Tambah Item ATK Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Kode Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="ATK-001"
                  value={formData.item_code}
                  onChange={(e) =>
                    setFormData({ ...formData, item_code: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nama Barang ATK
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kertas A4 80gr Sidu"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rim/Box/Pcs"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Stok
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Stok Min
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.min_stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}