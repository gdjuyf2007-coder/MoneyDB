import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  FileText,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { getCategoryByName } from '../constants/categories';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // 1. Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // 2. Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCategory = t.category.toLowerCase().includes(q);
          const matchNote = (t.note || '').toLowerCase().includes(q);
          const matchMethod = (t.paymentMethod || '').toLowerCase().includes(q);
          const matchAmount = String(t.amount).includes(q);
          const matchDate = t.date.includes(q);
          return matchCategory || matchNote || matchMethod || matchAmount || matchDate;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, typeFilter, searchQuery, sortBy]);

  const handleDeleteClick = (id: string) => {
    if (deletingId === id) {
      onDelete(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* List Header & Controls */}
      <div className="p-5 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              รายการความเคลื่อนไหว
            </h3>
            <p className="text-xs text-slate-500">
              พบ {filteredTransactions.length} รายการจากทั้งหมด {transactions.length} รายการ
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการใหม่</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-transactions-input"
              type="text"
              placeholder="ค้นหาหมวดหมู่, บันทึกช่วยจำ, วิธีชำระ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Type selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs shrink-0">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  typeFilter === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                รายจ่าย
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  typeFilter === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                รายรับ
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="date_desc">วันที่: ล่าสุดก่อน</option>
                <option value="date_asc">วันที่: เก่าสุดก่อน</option>
                <option value="amount_desc">จำนวนเงิน: มากไปน้อย</option>
                <option value="amount_asc">จำนวนเงิน: น้อยไปมาก</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Items */}
      {filteredTransactions.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {filteredTransactions.map((tx) => {
            const cat = getCategoryByName(tx.category, tx.type);
            const isDeleting = deletingId === tx.id;

            return (
              <div
                key={tx.id}
                className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {tx.category}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatThaiDate(tx.date)}
                      </span>

                      {tx.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {tx.paymentMethod}
                        </span>
                      )}

                      {tx.note && (
                        <span className="flex items-center gap-1 text-slate-600 truncate max-w-xs">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          {tx.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-base font-bold ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>

                  {/* Actions (Desktop: hover or always, Mobile: visible) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      title="แก้ไขรายการ"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(tx.id)}
                      title={isDeleting ? 'คลิกอีกครั้งเพื่อยืนยันการลบ' : 'ลบรายการ'}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        isDeleting
                          ? 'bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold px-2'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      {isDeleting ? (
                        <span>ยืนยัน</span>
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">ไม่พบรายการบันทึก</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {searchQuery || typeFilter !== 'all'
              ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองรายการ'
              : 'เริ่มบันทึกรายรับหรือรายจ่ายรายการแรกของเดือนนี้ได้ทันที'}
          </p>
          {!searchQuery && typeFilter === 'all' && (
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกรายการ</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
