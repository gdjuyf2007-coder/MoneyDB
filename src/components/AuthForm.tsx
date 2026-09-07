import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';

export const AuthForm: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, authError, clearAuthError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();

    if (!email || !password) return;

    try {
      setIsSubmitting(true);
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full text-left">
      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            clearAuthError();
          }}
          className={`flex-1 py-2 rounded-xl transition-all text-center cursor-pointer ${
            mode === 'login'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          เข้าสู่ระบบด้วยอีเมล
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            clearAuthError();
          }}
          className={`flex-1 py-2 rounded-xl transition-all text-center cursor-pointer ${
            mode === 'register'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          สมัครสมาชิกใหม่
        </button>
      </div>

      {authError && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{authError}</span>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ชื่อ - นามสกุล หรือ ชื่อเล่น
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            อีเมล (Email)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            รหัสผ่าน (Password)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === 'login' ? (
            <>
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบด้วยอีเมล</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>ยืนยันสร้างบัญชีใหม่</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-white px-3 text-slate-400 font-medium">หรือ</span>
        </div>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl border border-slate-300 shadow-2xs hover:shadow-xs transition-all disabled:opacity-60 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>เข้าสู่ระบบด้วยบัญชี Google</span>
      </button>
    </div>
  );
};
