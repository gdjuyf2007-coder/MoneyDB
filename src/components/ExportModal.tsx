import React from 'react';
import { X, Download, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { Transaction } from '../types';
import { formatThaiMonthYear, formatNumber } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentMonth: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentMonth,
}) => {
  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'ช่องทางชำระเงิน', 'บันทึกช่วยจำ'];
    const rows = transactions.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Thai support in Excel
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MoneyDB_รายงาน_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ส่งออกข้อมูลรายรับรายจ่าย</h3>
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

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            ระบบจะส่งออกรายการทั้งหมดของเดือน{' '}
            <strong className="text-slate-800">{formatThaiMonthYear(currentMonth)}</strong> จำนวน{' '}
            <strong className="text-emerald-700 font-semibold">{transactions.length} รายการ</strong> ในรูปแบบไฟล์ CSV (รองรับภาษาไทยใน Microsoft Excel และ Google Sheets)
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>ชื่อไฟล์ที่จะดาวน์โหลด:</span>
              <span className="font-mono font-medium text-slate-700 text-[11px]">
                MoneyDB_{currentMonth}.csv
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>การเข้ารหัส:</span>
              <span className="font-mono text-[11px]">UTF-8 with BOM (ภาษาไทยไม่เพี้ยน)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            ปิด
          </button>
          <button
            type="button"
            id="download-csv-btn"
            onClick={handleDownloadCSV}
            disabled={transactions.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด CSV ({transactions.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
