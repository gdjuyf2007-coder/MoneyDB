import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Transaction } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { PieChart as PieIcon, BarChart3, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getCategoryByName } from '../constants/categories';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  currentMonth: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  currentMonth,
}) => {
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');

  // 1. Group by Category
  const categoryData = useMemo(() => {
    const filtered = transactions.filter((t) => t.type === chartType);
    const map: Record<string, { name: string; value: number; color: string }> = {};

    filtered.forEach((t) => {
      const cat = getCategoryByName(t.category, chartType);
      if (!map[t.category]) {
        map[t.category] = {
          name: t.category,
          value: 0,
          color: cat.color,
        };
      }
      map[t.category].value += t.amount;
    });

    const list = Object.values(map).sort((a, b) => b.value - a.value);
    const total = list.reduce((sum, item) => sum + item.value, 0);

    return { list, total };
  }, [transactions, chartType]);

  // 2. Daily Timeline Data (days in current month)
  const dailyTimelineData = useMemo(() => {
    const [yearStr, monthStr] = currentMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const dayMap: Record<number, { day: number; label: string; income: number; expense: number }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dayMap[d] = {
        day: d,
        label: `${d}`,
        income: 0,
        expense: 0,
      };
    }

    transactions.forEach((t) => {
      const parts = t.date.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        if (dayMap[day]) {
          if (t.type === 'income') {
            dayMap[day].income += t.amount;
          } else {
            dayMap[day].expense += t.amount;
          }
        }
      }
    });

    return Object.values(dayMap);
  }, [transactions, currentMonth]);

  // 3. Payment Methods Breakdown
  const paymentMethodData = useMemo(() => {
    const expenseTx = transactions.filter((t) => t.type === 'expense');
    const map: Record<string, number> = {};
    expenseTx.forEach((t) => {
      const method = t.paymentMethod || 'ไม่ระบุ';
      map[method] = (map[method] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Category Distribution Donut */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                สัดส่วนตามหมวดหมู่
              </h3>
            </div>

            {/* Switch Income / Expense Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                id="tab-expense-chart"
                onClick={() => setChartType('expense')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  chartType === 'expense'
                    ? 'bg-white text-rose-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownCircle className="w-3 h-3" />
                รายจ่าย
              </button>
              <button
                id="tab-income-chart"
                onClick={() => setChartType('income')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  chartType === 'income'
                    ? 'bg-white text-emerald-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpCircle className="w-3 h-3" />
                รายรับ
              </button>
            </div>
          </div>

          {categoryData.list.length > 0 ? (
            <>
              <div className="h-56 w-full relative mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.list}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.list.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number | undefined) => [
                        formatCurrency(val || 0),
                        chartType === 'expense' ? 'รายจ่าย' : 'รายรับ',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] text-slate-400">รวมทั้งหมด</span>
                  <span className="text-sm font-bold text-slate-800">
                    ฿{formatNumber(categoryData.total)}
                  </span>
                </div>
              </div>

              {/* Category Legend & List */}
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                {categoryData.list.map((cat) => {
                  const percent = categoryData.total > 0 ? Math.round((cat.value / categoryData.total) * 100) : 0;
                  return (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-slate-700 truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-400 text-[11px]">{percent}%</span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(cat.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <PieIcon className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
              <p>ไม่มีข้อมูล{chartType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Daily Trend Timeline Chart */}
      <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                แนวโน้มรายวัน (Daily Cash Flow)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">รายรับ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600">รายจ่าย</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyTimelineData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: number | undefined, name: string | undefined) => [
                    formatCurrency(value || 0),
                    name === 'income' ? 'รายรับ' : 'รายจ่าย',
                  ]}
                  labelFormatter={(label) => `วันที่ ${label} ของเดือน`}
                />
                <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={16} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Payment Method Bar Summary */}
        {paymentMethodData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500 block mb-1.5">
              ช่องทางการชำระเงินที่ใช้บ่อย (รายจ่าย):
            </span>
            <div className="flex flex-wrap gap-2">
              {paymentMethodData.slice(0, 4).map((pm) => (
                <span
                  key={pm.name}
                  className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  {pm.name}: <strong className="font-semibold">{formatNumber(pm.value)} ฿</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
