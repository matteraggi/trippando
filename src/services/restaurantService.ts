import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    serverTimestamp,
    doc,
    deleteDoc,
    updateDoc,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Restaurant } from '../types/Restaurant';
import type { Visit } from '../types/Visit';

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

export const addVisit = async (restaurantId: string, visitData: Omit<Visit, 'id' | 'createdAt'>) => {
    // 1. Add visit to subcollection
    const visitRef = await addDoc(collection(db, `restaurants/${restaurantId}/visits`), {
        ...visitData,
        createdAt: serverTimestamp()
    });
    return visitRef;
};

export const subscribeToVisits = (restaurantId: string, callback: (data: Visit[]) => void) => {
    const q = query(
        collection(db, `restaurants/${restaurantId}/visits`),
        orderBy("date", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const visits = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Visit[];
        callback(visits);
    });
};

export const deleteVisit = async (restaurantId: string, visitId: string) => {
    try {
        await deleteDoc(doc(db, `restaurants/${restaurantId}/visits`, visitId));
    } catch (error) {
        console.error("Error deleting visit: ", error);
        throw error;
    }
};

export const updateVisit = async (restaurantId: string, visitId: string, visitData: Partial<Visit>) => {
    try {
        const visitRef = doc(db, `restaurants/${restaurantId}/visits`, visitId);
        await updateDoc(visitRef, {
            ...visitData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating visit: ", error);
        throw error;
    }
};

export const getVisit = async (restaurantId: string, visitId: string) => {
    try {
        const visitRef = doc(db, `restaurants/${restaurantId}/visits`, visitId);
        const visitSnap = await getDoc(visitRef);
        if (visitSnap.exists()) {
            return { id: visitSnap.id, ...visitSnap.data() } as Visit;
        }
        return null;
    } catch (error) {
        console.error("Error getting visit: ", error);
        throw error;
    }
};
