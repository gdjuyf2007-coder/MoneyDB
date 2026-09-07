import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MonthlySummary } from './components/MonthlySummary';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { ExportModal } from './components/ExportModal';
import { AuthForm } from './components/AuthForm';
import { Transaction, MonthlySummaryStats } from './types';
import {
  subscribeUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  subscribeUserBudgets,
  saveMonthlyBudget,
  seedSampleTransactions,
} from './services/transactionService';
import { getCurrentMonthStr } from './utils/formatters';
import {
  Wallet,
  Sparkles,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  LogIn,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, signInWithGoogle, authError, clearAuthError } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonthStr());
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Subscribe to real-time transactions and budgets when user is logged in
  useEffect(() => {
    if (!user) {
      setAllTransactions([]);
      setBudgets({});
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setErrorMessage(null);

    const unsubscribeTx = subscribeUserTransactions(
      user.uid,
      (transactions) => {
        setAllTransactions(transactions);
        setIsLoadingData(false);
      },
      (error) => {
        console.error('Transactions load error:', error);
        setErrorMessage('ไม่สามารถโหลดข้อมูลรายรับรายจ่ายได้');
        setIsLoadingData(false);
      }
    );

    const unsubscribeBudgets = subscribeUserBudgets(user.uid, (budgetMap) => {
      setBudgets(budgetMap);
    });

    return () => {
      unsubscribeTx();
      unsubscribeBudgets();
    };
  }, [user]);

  // Filter transactions strictly for the selected month
  const monthlyTransactions = useMemo(() => {
    return allTransactions.filter((t) => t.date.startsWith(currentMonth));
  }, [allTransactions, currentMonth]);

  // Compute stats for the selected month
  const monthlyStats: MonthlySummaryStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incCount = 0;
    let expCount = 0;

    monthlyTransactions.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount;
        incCount++;
      } else {
        expense += t.amount;
        expCount++;
      }
    });

    const [yearStr, monthStr] = currentMonth.split('-');
    const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();
    const dailyAvg = daysInMonth > 0 ? expense / daysInMonth : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      transactionCount: monthlyTransactions.length,
      incomeCount: incCount,
      expenseCount: expCount,
      dailyAverageExpense: dailyAvg,
    };
  }, [monthlyTransactions, currentMonth]);

  // Handlers
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (!user) return;
    if (editingTransaction) {
      await updateTransaction(user.uid, editingTransaction.id, data);
      showToast('แก้ไขรายการสำเร็จ');
    } else {
      await createTransaction(user.uid, data);
      showToast('บันทึกรายการสำเร็จ');
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteTransaction(user.uid, id);
      showToast('ลบรายการสำเร็จ');
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMessage('ไม่สามารถลบรายการได้');
    }
  };

  const handleSaveBudget = async (month: string, amount: number) => {
    if (!user) return;
    await saveMonthlyBudget(user.uid, month, amount);
    showToast('บันทึกงบประมาณประจำเดือนสำเร็จ');
  };

  const handleSeedDemoData = async () => {
    if (!user) return;
    try {
      setIsLoadingData(true);
      await seedSampleTransactions(user.uid, currentMonth);
      showToast('เพิ่มข้อมูลตัวอย่างสำเร็จแล้ว');
    } catch (err) {
      console.error('Seed error:', err);
      setErrorMessage('เกิดข้อผิดพลาดในการใส่ข้อมูลตัวอย่าง');
    } finally {
      setIsLoadingData(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm text-slate-600 font-medium">กำลังเตรียมระบบ MoneyDB...</p>
      </div>
    );
  }

  // Not logged in view: Welcome & Google Sign-In Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col">
        {/* Top Minimal Bar */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="วิทยาลัยอาชีวศึกษาแพร่"
              referrerPolicy="no-referrer"
              className="w-11 h-11 object-contain drop-shadow-xs"
            />
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">MoneyDB</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                Firebase Firestore
              </span>
            </div>
          </div>

          <button
            id="login-header-btn"
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 shadow-xs transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>เข้าสู่ระบบ</span>
          </button>
        </div>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 text-center">
            <div className="w-20 h-20 mx-auto flex items-center justify-center mb-5">
              <img
                src="/logo.png"
                alt="วิทยาลัยอาชีวศึกษาแพร่"
                referrerPolicy="no-referrer"
                className="w-20 h-20 object-contain drop-shadow-sm"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              MoneyDB
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              วิทยาลัยอาชีวศึกษาแพร่
            </p>
            <p className="text-sm font-medium text-emerald-700 mt-0.5">
              เว็บจัดการรายรับรายจ่าย สรุปผลรายเดือน & กราฟวิเคราะห์
            </p>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              เก็บบันทึกข้อมูลทางการเงินของคุณอย่างปลอดภัยบนระบบฐานข้อมูล{' '}
              <strong className="text-slate-700">Firebase Firestore</strong> พร้อมเข้าถึงได้ทุกที่ทุกเวลา
            </p>

            {/* Auth Form (Email/Password + Google) */}
            <div className="mt-6 mb-6">
              <AuthForm />
            </div>

            {/* Features highlights */}
            <div className="space-y-2 text-left text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>สรุปผลรายรับ รายจ่าย และยอดคงเหลือสุทธิ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>กราฟวิเคราะห์สัดส่วนหมวดหมู่และแนวโน้มการใช้จ่าย</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ตั้งเป้าหมายงบประมาณรายเดือน & ส่งออกรายงาน Excel</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ความปลอดภัยมาตรฐาน Firebase Auth & Firestore Rules</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Logged-in View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onSeedData={handleSeedDemoData}
        hasTransactions={monthlyTransactions.length > 0}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              ปิด
            </button>
          </div>
        )}

        {/* 1. Monthly Summary Cards */}
        <MonthlySummary
          stats={monthlyStats}
          budgetAmount={budgets[currentMonth] || null}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* 2. Analytical Charts */}
        <AnalyticsCharts
          transactions={monthlyTransactions}
          currentMonth={currentMonth}
        />

        {/* 3. Transactions List */}
        <TransactionList
          transactions={monthlyTransactions}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setIsAddModalOpen(true);
          }}
          onDelete={handleDeleteTransaction}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
        />
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentMonth={currentMonth}
        currentBudget={budgets[currentMonth] || null}
        onSaveBudget={handleSaveBudget}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={monthlyTransactions}
        currentMonth={currentMonth}
      />
    </div>
  );
}
