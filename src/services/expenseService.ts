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
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
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

export const getExpense = async (expenseId: string): Promise<Expense | null> => {
    try {
        const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Expense;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting expense:", error);
        throw error;
    }
};

export const updateExpense = async (expenseId: string, expenseData: Partial<CreateExpenseData>) => {
    try {
        const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
        const updateData: any = { ...expenseData };
        if (expenseData.date) {
            updateData.date = Timestamp.fromDate(expenseData.date);
        }
        // Always update timestamp
        updateData.updatedAt = serverTimestamp();

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error("Error updating expense:", error);
        throw error;
    }
};

export const deleteExpense = async (expenseId: string) => {
    try {
        const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting expense:", error);
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
