import { db } from '../firebase';
import type { Expense } from '../types/Expense';
import {
    collection,
    addDoc,
    serverTimestamp,
    Timestamp,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';

const EXPENSES_COLLECTION = 'expenses';

export interface CreateExpenseData {
    amount: number;
    currency: string;
    category: string;
    description: string;
    paidBy: string;
    date: Date;
    tripId: string;
}

export const addExpense = async (expenseData: CreateExpenseData) => {
    try {
        await addDoc(collection(db, EXPENSES_COLLECTION), {
            ...expenseData,
            date: Timestamp.fromDate(expenseData.date),
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
    }
};

export const subscribeToExpenses = (tripId: string, callback: (expenses: Expense[]) => void) => {
    const q = query(
        collection(db, EXPENSES_COLLECTION),
        where('tripId', '==', tripId),
        orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const expenses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Expense));
        callback(expenses);
    });
};
