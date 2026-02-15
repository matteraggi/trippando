import { Timestamp } from 'firebase/firestore';

export interface Restaurant {
    id: string;
    name: string;
    address: string;
    city?: string; // Extracted from address
    country?: string; // Extracted from address
    googleMapsLink?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    cuisineType?: string;
    tripId?: string; // Optional link to a specific trip
    userId: string; // The user who added this restaurant to their list
    createdAt: Date;

    visitCount?: number;
    averageRating?: number;
    averagePrice?: number;
}

export interface Visit {
    id: string;
    restaurantId: string;
    userId: string;
    date: Date;
    rating: number; // 1-10
    totalPrice: number;
    notes?: string;
    dishes: {
        name: string;
        price?: number;
        rating?: number;
    }[];
    images?: string[];
    taggedFriends?: string[]; // User IDs
}
