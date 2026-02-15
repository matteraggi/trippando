import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    serverTimestamp,
    doc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Restaurant } from '../types/Restaurant';

export const addRestaurant = async (userId: string, data: Omit<Restaurant, 'id' | 'userId' | 'createdAt' | 'visitCount' | 'averageRating' | 'averagePrice'>) => {
    try {
        // Remove undefined fields to avoid Firebase errors
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );

        const docRef = await addDoc(collection(db, 'restaurants'), {
            ...cleanData,
            userId,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding restaurant: ", error);
        throw error;
    }
};

export const subscribeToRestaurants = (userId: string, callback: (restaurants: Restaurant[]) => void) => {
    const q = query(
        collection(db, 'restaurants'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const restaurants = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            } as Restaurant;
        });
        callback(restaurants);
    });
};

export const subscribeToRestaurant = (restaurantId: string, callback: (data: Restaurant | null) => void) => {
    const docRef = doc(db, "restaurants", restaurantId);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() } as Restaurant);
        } else {
            callback(null);
        }
    });
};
