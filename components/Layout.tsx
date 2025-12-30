'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  LayoutDashboard,
  Users,
  Settings,
  Flag,
  Shield,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  History,
  Ban,
  Bell,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-primary-400' },
  { name: 'Users', href: '/users', icon: Users, color: 'text-cyan-400' },
  { name: 'Reports', href: '/reports', icon: AlertTriangle, color: 'text-rose-400' },
  { name: 'Blocks', href: '/blocks', icon: Ban, color: 'text-orange-400' },
  { name: 'Feedback', href: '/feedback', icon: MessageSquare, color: 'text-emerald-400' },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, color: 'text-violet-400' },
  { name: 'Activity Logs', href: '/activity-logs', icon: History, color: 'text-amber-400' },
  { name: 'Feature Flags', href: '/features', icon: Flag, color: 'text-blue-400' },
  { name: 'App Limits', href: '/limits', icon: Shield, color: 'text-teal-400' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-zinc-400' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const currentPage = navigation.find((item) => item.href === pathname || pathname?.startsWith(item.href + '/'));

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-dark-900 border-r border-dark-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-dark-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-lg font-bold gradient-text">bearound</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-zinc-200 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-600/15 text-primary-400 border-l-2 border-primary-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-dark-800/50'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-400' : item.color} group-hover:scale-110 transition-transform`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary-400" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-dark-700/50 p-4">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-dark-800/50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center ring-2 ring-primary-500/30">
                  <span className="text-white font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{user?.email || 'Admin'}</p>
                <p className="text-xs text-zinc-500">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 border border-dark-700 hover:border-rose-500/30"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-zinc-400 hover:text-zinc-200 p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                {currentPage && (
                  <currentPage.icon className={`h-5 w-5 ${currentPage.color}`} />
                )}
                <h2 className="text-lg font-semibold text-zinc-100">
                  {currentPage?.name || 'Admin Panel'}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg border border-dark-700/50 text-zinc-400 hover:border-dark-600 transition-colors cursor-pointer">
                <Search className="h-4 w-4" />
                <span className="text-sm">Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-dark-700 rounded border border-dark-600 text-zinc-500">
                  ⌘K
                </kbd>
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-dark-800 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}
