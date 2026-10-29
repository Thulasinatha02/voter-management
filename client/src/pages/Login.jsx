import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeButton from '../components/common/ThemeButton';

const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center lg:justify-start p-4 sm:p-8 lg:pl-16 xl:pl-24 overflow-hidden">
      {/* FULL BACKGROUND IMAGE (CRISP, UNBLURRED, FULL ORIGINAL RESOLUTION & VIBRANCY) */}
      <div
        className="absolute inset-0 bg-cover bg-right sm:bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/banner-desktop-v5.png')`,
          imageRendering: 'crisp-edges',
        }}
      />

      {/* Subtle soft gradient on the left side to ensure perfect text readability without covering the people */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />

      {/* WHITE TRANSLUCENT FROSTED GLASSMORPHISM CARD ON LEFT SIDE */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300 my-auto">
        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-white/80 relative overflow-hidden">
          {/* Top subtle green accent ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/90 p-1.5 shadow-md shadow-emerald-950/10 border border-slate-200/60 mb-2.5">
              <img
                src="/admk logo.png"
                alt="AIADMK Two Leaves Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="block">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 mb-1">
                Official Electoral Portal
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Console
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Ward Administrative & Demographic System
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username or Official ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white/90 border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20 transition-all font-semibold shadow-2xs"
                  placeholder="e.g. admin or operator"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white/90 border border-slate-200/90 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/20 transition-all font-semibold shadow-2xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Panel */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 text-[11px] text-slate-600 space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Quick Demo Credentials:
              </div>
              <div className="flex justify-between items-center">
                <span>Superadmin: <code className="text-emerald-800 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-100">admin</code> / <code className="text-emerald-800 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-100">admin123</code></span>
                <button
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-extrabold underline hover:no-underline px-1.5 py-0.5"
                >
                  Apply
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>Operator: <code className="text-emerald-800 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-100">operator</code> / <code className="text-emerald-800 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-100">admin123</code></span>
                <button
                  type="button"
                  onClick={() => { setUsername('operator'); setPassword('admin123'); }}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-extrabold underline hover:no-underline px-1.5 py-0.5"
                >
                  Apply
                </button>
              </div>
            </div>

            <ThemeButton
              type="submit"
              disabled={loading}
              variant="gradient"
              size="lg"
              className="w-full shadow-lg shadow-emerald-600/30 font-bold text-sm py-3 rounded-2xl"
              icon={ArrowRight}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </ThemeButton>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Compliant with administrative data privacy & electoral verification standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
