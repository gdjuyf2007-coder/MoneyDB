import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Sliders,
  Calendar,
  Download,
  Sparkles,
} from 'lucide-react';
import { formatThaiMonthYear, getCurrentMonthStr, shiftMonth } from '../utils/formatters';

interface NavbarProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenExportModal: () => void;
  onSeedData: () => void;
  hasTransactions: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onMonthChange,
  onOpenAddModal,
  onOpenBudgetModal,
  onOpenExportModal,
  onSeedData,
  hasTransactions,
}) => {
  const { user, signInWithGoogle, signOutUser, loading } = useAuth();
  const currentActualMonth = getCurrentMonthStr();

  const handlePrevMonth = () => {
    onMonthChange(shiftMonth(currentMonth, -1));
  };

  const handleNextMonth = () => {
    onMonthChange(shiftMonth(currentMonth, 1));
  };

  const handleResetToCurrent = () => {
    onMonthChange(currentActualMonth);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              alt="วิทยาลัยอาชีวศึกษาแพร่"
              referrerPolicy="no-referrer"
              className="w-11 h-11 object-contain drop-shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 tracking-tight">MoneyDB</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                  Firebase
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">จัดการรายรับรายจ่าย & สรุปผล</p>
            </div>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              id="prev-month-btn"
              onClick={handlePrevMonth}
              title="เดือนก่อนหน้า"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2 py-1 text-xs sm:text-sm font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
              <span>{formatThaiMonthYear(currentMonth)}</span>
            </div>

            <button
              id="next-month-btn"
              onClick={handleNextMonth}
              title="เดือนถัดไป"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {currentMonth !== currentActualMonth && (
              <button
                id="reset-month-btn"
                onClick={handleResetToCurrent}
                className="hidden md:inline-flex text-xs px-2 py-1 rounded-md text-emerald-700 hover:bg-emerald-100 font-medium transition-colors cursor-pointer"
              >
                เดือนนี้
              </button>
            )}
          </div>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {!hasTransactions && (
                  <button
                    id="seed-demo-btn"
                    onClick={onSeedData}
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                    title="ใส่ข้อมูลตัวอย่างเพื่อทดสอบกราฟและการสรุปผล"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>เติมข้อมูลทดลอง</span>
                  </button>
                )}

                <button
                  id="budget-btn"
                  onClick={onOpenBudgetModal}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="ตั้งงบประมาณรายเดือน"
                >
                  <Sliders className="w-4 h-4" />
                </button>

                <button
                  id="export-btn"
                  onClick={onOpenExportModal}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="ส่งออกรายงาน (CSV)"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  id="add-transaction-navbar-btn"
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">บันทึกรายการ</span>
                  <span className="sm:hidden">เพิ่ม</span>
                </button>

                {/* Profile & Sign Out */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                      {user.displayName || 'ผู้ใช้'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>

                  <button
                    id="signout-btn"
                    onClick={signOutUser}
                    title="ออกจากระบบ"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                id="google-signin-btn"
                onClick={signInWithGoogle}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium rounded-xl shadow-sm transition-all cursor-pointer"
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
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
