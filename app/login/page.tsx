'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-950">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-dark-700"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminApi.login(email, password);
      
      if (response.success && response.data.user) {
        // Check if user is admin
        if (response.data.user.role !== 'admin') {
          toast.error('You do not have admin access');
          setLoading(false);
          return;
        }

        setAuth(response.data.user, response.data.tokens.accessToken);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      const errorDetails = error.response?.data?.errors;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        const validationErrors = errorDetails.map((e: any) => e.message).join(', ');
        toast.error(validationErrors || errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary-600/20 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-violet-600/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 mb-4 shadow-glow">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">bearound</h1>
          <p className="text-zinc-400 mt-2">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="card-dark p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Welcome back</h2>
            <p className="text-zinc-500 text-sm mt-1">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 input-dark"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 input-dark"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-600">
            API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}
          </p>
        </div>
      </div>
    </div>
  );
}
