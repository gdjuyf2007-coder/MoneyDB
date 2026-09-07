import React, { useState, useEffect } from 'react';
import { X, Check, Sliders } from 'lucide-react';
import { formatThaiMonthYear } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  currentBudget: number | null;
  onSaveBudget: (month: string, amount: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  currentBudget,
  onSaveBudget,
}) => {
  const [budgetStr, setBudgetStr] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentBudget !== null && currentBudget > 0) {
      setBudgetStr(String(currentBudget));
    } else {
      setBudgetStr('');
    }
    setErrorMsg(null);
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetStr);
    if (isNaN(amount) || amount < 0) {
      setErrorMsg('กรุณากรอกงบประมาณที่ถูกต้อง (0 หรือมากกว่า)');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveBudget(currentMonth, amount);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save budget:', err);
      setErrorMsg('ไม่สามารถบันทึกงบประมาณได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ตั้งงบประมาณรายเดือน</h3>
              <p className="text-xs text-slate-500">{formatThaiMonthYear(currentMonth)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              งบประมาณที่ตั้งไว้สำหรับเดือนนี้ (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ฿
              </span>
              <input
                id="budget-amount-input"
                type="number"
                step="any"
                min="0"
                required
                placeholder="เช่น 20,000"
                value={budgetStr}
                onChange={(e) => setBudgetStr(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              ระบบจะคอยเปรียบเทียบและแจ้งเตือนเมื่อรายจ่ายของคุณเข้าใกล้งบประมาณที่ตั้งไว้
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[10000, 15000, 20000, 30000, 50000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setBudgetStr(String(val))}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                {val.toLocaleString()} ฿
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="submit-budget-btn"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกงบประมาณ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
