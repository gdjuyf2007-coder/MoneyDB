import { CategoryDef } from '../types';

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', color: '#f97316', iconName: 'Utensils' },
  { id: 'transport', name: 'การเดินทางและรถยนต์', type: 'expense', color: '#3b82f6', iconName: 'Car' },
  { id: 'shopping', name: 'ช้อปปิ้งและของใช้', type: 'expense', color: '#ec4899', iconName: 'ShoppingBag' },
  { id: 'housing', name: 'ที่อยู่อาศัยและค่าเช่า', type: 'expense', color: '#8b5cf6', iconName: 'Home' },
  { id: 'bills', name: 'บิลและสาธารณูปโภค', type: 'expense', color: '#eab308', iconName: 'Receipt' },
  { id: 'entertainment', name: 'ความบันเทิงและสันทนาการ', type: 'expense', color: '#06b6d4', iconName: 'Film' },
  { id: 'health', name: 'สุขภาพและยา', type: 'expense', color: '#ef4444', iconName: 'HeartPulse' },
  { id: 'education', name: 'การศึกษาและหนังสือ', type: 'expense', color: '#10b981', iconName: 'GraduationCap' },
  { id: 'family', name: 'ครอบครัวและสัตว์เลี้ยง', type: 'expense', color: '#f43f5e', iconName: 'Users' },
  { id: 'other_expense', name: 'รายจ่ายอื่นๆ', type: 'expense', color: '#64748b', iconName: 'MoreHorizontal' },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { id: 'salary', name: 'เงินเดือน/ค่าจ้าง', type: 'income', color: '#10b981', iconName: 'Briefcase' },
  { id: 'bonus', name: 'โบนัสและเบี้ยขยัน', type: 'income', color: '#059669', iconName: 'Gift' },
  { id: 'business', name: 'ธุรกิจ/ค้าขาย', type: 'income', color: '#0284c7', iconName: 'Store' },
  { id: 'freelance', name: 'งานเสริม/ฟรีแลนซ์', type: 'income', color: '#6366f1', iconName: 'Laptop' },
  { id: 'investment', name: 'เงินปันผล/ลงทุน', type: 'income', color: '#8b5cf6', iconName: 'TrendingUp' },
  { id: 'gift', name: 'เงินได้รับ/ของขวัญ', type: 'income', color: '#ec4899', iconName: 'Heart' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', color: '#64748b', iconName: 'PlusCircle' },
];

export const PAYMENT_METHODS = [
  'เงินสด',
  'โอนเงิน / พร้อมเพย์',
  'บัตรเครดิต',
  'บัตรเดบิต',
  'กระเป๋าเงินออนไลน์ (e-Wallet)',
];

export function getCategoryByName(name: string, type: 'income' | 'expense'): CategoryDef {
  const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const found = list.find((c) => c.name === name);
  if (found) return found;
  return {
    id: 'custom',
    name,
    type,
    color: type === 'expense' ? '#ef4444' : '#10b981',
    iconName: type === 'expense' ? 'Tag' : 'DollarSign',
  };
}
