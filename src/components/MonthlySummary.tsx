import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { MonthlySummaryStats } from '../types';

interface MonthlySummaryProps {
  stats: MonthlySummaryStats;
  budgetAmount: number | null;
  onOpenBudgetModal: () => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  stats,
  budgetAmount,
  onOpenBudgetModal,
}) => {
  const budgetPercentage =
    budgetAmount && budgetAmount > 0
      ? Math.round((stats.totalExpense / budgetAmount) * 100)
      : null;

  const remainingBudget =
    budgetAmount && budgetAmount > 0 ? budgetAmount - stats.totalExpense : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income */}
      <div
        id="card-total-income"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">รายรับรวม (Income)</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-emerald-600 tracking-tight">
            +{formatCurrency(stats.totalIncome)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.incomeCount > 0 ? `${stats.incomeCount} รายการที่บันทึก` : 'ยังไม่มีรายรับในเดือนนี้'}
          </p>
        </div>
      </div>

      {/* 2. Total Expense */}
      <div
        id="card-total-expense"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">รายจ่ายรวม (Expense)</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-rose-600 tracking-tight">
            -{formatCurrency(stats.totalExpense)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>{stats.expenseCount > 0 ? `${stats.expenseCount} รายการ` : 'ยังไม่มีรายจ่าย'}</span>
            {stats.dailyAverageExpense > 0 && (
              <span>เฉลี่ย {formatNumber(stats.dailyAverageExpense)} บ./วัน</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Net Balance */}
      <div
        id="card-net-balance"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">คงเหลือสุทธิ (Net Balance)</span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              stats.netBalance >= 0
                ? 'bg-teal-50 text-teal-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p
            className={`text-2xl font-bold tracking-tight ${
              stats.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {stats.netBalance >= 0 ? '' : '-'}
            {formatCurrency(Math.abs(stats.netBalance))}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.netBalance >= 0
              ? 'การเงินเป็นบวก รายรับมากกว่ารายจ่าย'
              : 'ระวัง! รายจ่ายมากกว่ารายรับ'}
          </p>
        </div>
      </div>

      {/* 4. Budget Tracker */}
      <div
        id="card-budget-tracker"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">งบประมาณรายเดือน (Budget)</span>
          <button
            onClick={onOpenBudgetModal}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
          >
            {budgetAmount ? 'แก้ไขงบ' : '+ ตั้งงบ'}
          </button>
        </div>

        {budgetAmount && budgetAmount > 0 ? (
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(budgetAmount)}
              </span>
              <span
                className={`text-xs font-semibold ${
                  (budgetPercentage || 0) > 100
                    ? 'text-rose-600'
                    : (budgetPercentage || 0) > 85
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {budgetPercentage}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (budgetPercentage || 0) > 100
                    ? 'bg-rose-500'
                    : (budgetPercentage || 0) > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage || 0, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              {remainingBudget !== null && remainingBudget >= 0 ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  เหลืองบ {formatNumber(remainingBudget)} บ.
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600">
                  <AlertTriangle className="w-3 h-3" />
                  เกินงบ {formatNumber(Math.abs(remainingBudget || 0))} บ.
                </span>
              )}
              <span>ใช้ไป {formatNumber(stats.totalExpense)} บ.</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-col justify-between">
            <p className="text-xs text-slate-400">ยังไม่ได้ตั้งเป้างบประมาณประจำเดือนนี้</p>
            <button
              onClick={onOpenBudgetModal}
              className="mt-2 text-xs py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-center transition-colors cursor-pointer"
            >
              คลิกเพื่อตั้งงบจำกัดค่าใช้จ่าย
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
