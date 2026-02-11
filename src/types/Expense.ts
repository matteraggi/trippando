import { Timestamp } from 'firebase/firestore';

export interface Expense {
    id: string;
    amount: number;
    currency: string;
    category: string;
    description: string;
    paidBy: string; // User UID
    date: Timestamp;
    tripId: string;
    createdAt: Timestamp;
}
