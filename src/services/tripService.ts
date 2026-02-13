import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    orderBy,
    Timestamp,
    doc,
    DocumentSnapshot,
    updateDoc,
    deleteDoc,
    getDocs,
    writeBatch,
    arrayUnion,
    getDoc
} from 'firebase/firestore';
import type { Trip } from '../types/Trip';


export const addTripMember = async (tripId: string, userId: string) => {
    try {
        const tripRef = doc(db, TRIPS_COLLECTION, tripId);
        await updateDoc(tripRef, {
            members: arrayUnion(userId),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding member to trip:", error);
        throw error;
    }
};

const TRIPS_COLLECTION = 'trips';

export const createTrip = async (
    userId: string,
    tripData: { name: string; startDate: Date; endDate: Date; coverImage?: string; icon?: string; color?: string }
) => {
    try {
        await addDoc(collection(db, TRIPS_COLLECTION), {
            ...tripData,
            startDate: Timestamp.fromDate(tripData.startDate),
            endDate: Timestamp.fromDate(tripData.endDate),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            members: [userId]
        });
    } catch (error) {
        console.error("Error creating trip:", error);
        throw error;
    }
};

export const subscribeToTrips = (userId: string, callback: (trips: Trip[]) => void) => {
    const q = query(
        collection(db, TRIPS_COLLECTION),
        where('members', 'array-contains', userId),
        orderBy('startDate', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const trips = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Trip));
        callback(trips);
    });
};

export const subscribeToTrip = (tripId: string, callback: (trip: Trip | null) => void) => {
    return onSnapshot(doc(db, TRIPS_COLLECTION, tripId), (docSnap: DocumentSnapshot) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() } as Trip);
        } else {
            callback(null);
        }
    });
};

export const updateTrip = async (tripId: string, tripData: Partial<any>) => {
    try {
        const dataToUpdate: any = { ...tripData, updatedAt: serverTimestamp() };
        if (tripData.startDate instanceof Date) dataToUpdate.startDate = Timestamp.fromDate(tripData.startDate);
        if (tripData.endDate instanceof Date) dataToUpdate.endDate = Timestamp.fromDate(tripData.endDate);

        await updateDoc(doc(db, TRIPS_COLLECTION, tripId), dataToUpdate);
    } catch (error) {
        console.error("Error updating trip:", error);
        throw error;
    }
};

export const deleteTrip = async (tripId: string) => {
    try {
        // 1. Delete all expenses associated with this trip
        const expensesQuery = query(collection(db, 'expenses'), where('tripId', '==', tripId));
        const expensesSnapshot = await getDocs(expensesQuery);

        const batch = writeBatch(db);
        expensesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Commit the batch for expenses
        await batch.commit();

        // 2. Delete the trip itself
        await deleteDoc(doc(db, TRIPS_COLLECTION, tripId));

    } catch (error) {
        console.error("Error deleting trip:", error);
        throw error;
    }
};

export const getTrip = async (tripId: string): Promise<Trip | null> => {
    const docRef = doc(db, TRIPS_COLLECTION, tripId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Trip;
    }
    return null;
};
