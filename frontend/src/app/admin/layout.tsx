'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  Boxes,
  Package,
  Command,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Loan (Peminjaman)', href: '/admin/loans', icon: ArrowLeftRight },
    { name: 'Request (ATK)', href: '/admin/atk-requests', icon: FileSpreadsheet },
    { name: 'Stock Aset', href: '/admin/assets', icon: Boxes },
    { name: 'Stock ATK', href: '/admin/atk', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* SIDEBAR MODERN KIRI */}
      <aside className="w-72 bg-white border-r border-slate-200/80 flex flex-col hidden md:flex sticky top-0 h-screen z-20">
        
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-md shadow-slate-900/10">
              <Command size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm tracking-tight">Inventaris Kantor</h2>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Enterprise Core</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Main Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Icon size={17} className={`transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">Administrator</p>
                <p className="text-[10px] text-slate-400 truncate">admin@office.com</p>
              </div>
            </div>
            <Link href="/" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Keluar">
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}