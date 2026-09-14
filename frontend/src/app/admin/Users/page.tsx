'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Users, Plus, Search, Shield, Mail, Trash2, UserCheck, Pencil, X } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const API_URL = 'http://127.0.0.1:8000/api/v1/users';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk modal & form input pegawai baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('staff'); // Role default
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const authHeaders = () => ({
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, { headers: authHeaders() });

      if (!res.ok) throw new Error('Gagal memuat data pegawai');
      const result = await res.json();
      setUsers(Array.isArray(result) ? result : result.data || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as { id?: number };
        setCurrentUserId(user.id ?? null);
      } catch {
        setCurrentUserId(null);
      }
    }

    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(editingUser ? `${API_URL}/${editingUser.id}` : API_URL, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          ...(formPassword ? { password: formPassword } : {}),
          role: formRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || JSON.stringify(data.errors) || 'Gagal menambahkan pegawai baru';
        throw new Error(errorMsg);
      }

      toast.success(editingUser ? 'Akun berhasil diperbarui!' : 'Akun berhasil ditambahkan!');
      closeModal();
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('staff');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role === 'admin' ? 'admin' : 'staff');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: number) => {
    if (id === currentUserId) {
      toast.error('Akun admin yang sedang digunakan tidak dapat dihapus.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus pegawai ini?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Gagal menghapus pegawai');
      }

      toast.success('Pegawai berhasil dihapus');
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus data');
    }
  };

  const filteredUsers = users.filter((user) => {
    const name = user?.name ?? '';
    const email = user?.email ?? '';
    const query = searchTerm.toLowerCase();

    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header Halaman */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-purple-600" size={22} /> Data Pegawai / User
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola akun pengguna, hak akses, dan staff kantor.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <Plus size={16} /> Tambah Pegawai
          </button>
        </div>
      </div>

      {/* Tabel Data Pegawai */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-4 px-4">Nama Lengkap</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Role / Hak Akses</th>
                <th className="py-4 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">Memuat data pegawai...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-black flex items-center justify-center text-xs shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      {user.name || 'Tanpa Nama'}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium flex items-center gap-1.5 pt-4.5">
                      <Mail size={13} className="text-slate-400" /> {user.email || '-'}
                    </td>
                    <td className="py-4 px-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Shield size={12} /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <UserCheck size={12} /> Staff
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Edit Akun"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUserId}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rose-50"
                          title={user.id === currentUserId ? 'Akun aktif tidak dapat dihapus' : 'Hapus Akun'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">Tidak ada data pegawai ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH PEGAWAI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900">{editingUser ? 'Edit Akun Pegawai' : 'Tambah Pegawai Baru'}</h3>
                <p className="text-xs text-slate-500 mt-1">{editingUser ? 'Perbarui informasi akun pegawai.' : 'Masukkan informasi akun staff atau admin kantor.'}</p>
              </div>
              <button type="button" onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-700" title="Tutup">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Kantor</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: budi@kantor.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Hak Akses (Role)</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-purple-600/20"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Simpan Pegawai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}