import type { Timestamp } from "firebase/firestore";

export interface Visit {
    id: string;
    restaurantId: string;
    userId: string;
    date: Timestamp;
    rating: number; // 1-5
    totalPrice: number;
    notes?: string;
    dishes?: {
        name: string;
        rating?: number;
    }[];
    images?: string[];
    taggedFriends?: string[]; // User IDs
}
