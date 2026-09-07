import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Transaction, MonthlyBudget } from '../types';

export function subscribeUserTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (error: unknown) => void
) {
  const collectionPath = `users/${userId}/transactions`;
  const collRef = collection(db, 'users', userId, 'transactions');
  const q = query(collRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId || userId,
          type: data.type,
          amount: Number(data.amount),
          category: data.category,
          note: data.note || '',
          date: data.date,
          paymentMethod: data.paymentMethod || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
        });
      });
      onUpdate(items);
    },
    (error) => {
      console.error('Snapshot error on transactions:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

export async function createTransaction(
  userId: string,
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const collectionPath = `users/${userId}/transactions`;
  try {
    const docRef = doc(collection(db, 'users', userId, 'transactions'));
    const newTx: Transaction = {
      id: docRef.id,
      userId,
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      note: data.note || '',
      date: data.date,
      paymentMethod: data.paymentMethod || '',
      createdAt: new Date().toISOString(),
    };

    await setDoc(docRef, newTx);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docPath = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.amount !== undefined) updatePayload.amount = Number(data.amount);
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.note !== undefined) updatePayload.note = data.note;
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.paymentMethod !== undefined) updatePayload.paymentMethod = data.paymentMethod;

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  const docPath = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeUserBudgets(
  userId: string,
  onUpdate: (budgets: Record<string, number>) => void
) {
  const collectionPath = `users/${userId}/budgets`;
  const collRef = collection(db, 'users', userId, 'budgets');

  return onSnapshot(
    collRef,
    (snapshot) => {
      const budgetMap: Record<string, number> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.month && typeof data.budgetAmount === 'number') {
          budgetMap[data.month] = data.budgetAmount;
        }
      });
      onUpdate(budgetMap);
    },
    (error) => {
      console.error('Snapshot error on budgets:', error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

export async function saveMonthlyBudget(
  userId: string,
  month: string,
  amount: number
): Promise<void> {
  const docPath = `users/${userId}/budgets/${month}`;
  try {
    const docRef = doc(db, 'users', userId, 'budgets', month);
    const budgetDoc: MonthlyBudget = {
      id: month,
      userId,
      month,
      budgetAmount: Number(amount),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, budgetDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function seedSampleTransactions(userId: string, currentMonthStr: string): Promise<void> {
  const samples = [
    { type: 'income', amount: 45000, category: 'เงินเดือน/ค่าจ้าง', date: `${currentMonthStr}-01`, note: 'เงินเดือนประจำเดือน', paymentMethod: 'โอนเงิน / พร้อมเพย์' },
    { type: 'income', amount: 3500, category: 'งานเสริม/ฟรีแลนซ์', date: `${currentMonthStr}-05`, note: 'ออกแบบกราฟิกเว็บไซต์', paymentMethod: 'โอนเงิน / พร้อมเพย์' },
    { type: 'expense', amount: 450, category: 'อาหารและเครื่องดื่ม', date: `${currentMonthStr}-02`, note: 'ทานข้าวนอกบ้านกับเพื่อน', paymentMethod: 'พร้อมเพย์' },
    { type: 'expense', amount: 1200, category: 'ช้อปปิ้งและของใช้', date: `${currentMonthStr}-03`, note: 'ซื้อของเข้าตู้เย็นซูเปอร์มาร์เก็ต', paymentMethod: 'บัตรเครดิต' },
    { type: 'expense', amount: 800, category: 'การเดินทางและรถยนต์', date: `${currentMonthStr}-04`, note: 'เติมน้ำมันรถยนต์', paymentMethod: 'บัตรเครดิต' },
    { type: 'expense', amount: 320, category: 'อาหารและเครื่องดื่ม', date: `${currentMonthStr}-06`, note: 'กาแฟและขนมปังช่วงบ่าย', paymentMethod: 'เงินสด' },
    { type: 'expense', amount: 1850, category: 'บิลและสาธารณูปโภค', date: `${currentMonthStr}-07`, note: 'ค่าไฟฟ้าและอินเทอร์เน็ตบ้าน', paymentMethod: 'โอนเงิน / พร้อมเพย์' },
    { type: 'expense', amount: 6500, category: 'ที่อยู่อาศัยและค่าเช่า', date: `${currentMonthStr}-01`, note: 'ค่าเช่าห้องพัก', paymentMethod: 'โอนเงิน / พร้อมเพย์' },
  ] as const;

  for (const s of samples) {
    await createTransaction(userId, {
      type: s.type,
      amount: s.amount,
      category: s.category,
      note: s.note,
      date: s.date,
      paymentMethod: s.paymentMethod,
    });
  }

  // Also set a recommended default budget for this month
  await saveMonthlyBudget(userId, currentMonthStr, 25000);
}
