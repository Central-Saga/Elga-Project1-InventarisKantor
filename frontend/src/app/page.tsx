'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';

interface Category {
  id?: number;
  name?: string;
}

interface Asset {
  id: number;
  asset_code: string;
  name: string;
  category?: string | Category | null;
  status: 'available' | 'borrowed' | 'maintenance';
}

export default function HomePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = async () => {
    try {
      const data = await fetchAPI<Asset[]>('assets');
      setAssets(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data aset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="mb-6 flex justify-between items-center border-b pb-4">
        <div>
          <div className="flex gap-4 mb-2">
            <span className="text-sm font-bold text-blue-600">• Aset Utama</span>
            <Link href="/atk" className="text-sm text-gray-500 hover:text-blue-600 transition">
              → Inventaris ATK
            </Link>
            <Link href="/loans" className="text-sm text-gray-500 hover:text-blue-600 transition">
              → Peminjaman Aset
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Daftar Aset Utama
          </h1>
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
                <th className="py-3 px-4 font-semibold">Kode Aset</th>
                <th className="py-3 px-4 font-semibold">Nama Aset</th>
                <th className="py-3 px-4 font-semibold">Kategori</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Memuat data aset...
                  </td>
                </tr>
              ) : assets.length > 0 ? (
                assets.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-blue-600">
                      {item.asset_code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4">
                      {typeof item.category === 'object' && item.category !== null
                        ? item.category.name || '-'
                        : item.category || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                          item.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'borrowed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status === 'available'
                          ? 'Tersedia'
                          : item.status === 'borrowed'
                          ? 'Dipinjam'
                          : 'Perbaikan'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Belum ada data aset utama.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}