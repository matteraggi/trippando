import { doc, getDoc, setDoc, updateDoc, Timestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    createdAt: Timestamp;
}

// ...

export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const usersRef = collection(db, 'users');
    // Simple prefix search. Note: This is case-sensitive and limited. 
    // Ideally use a proper search service (Algolia/Typesense) or simple normalization (lowercase fields).
    // For now, we'll try to match exact or standard prefix.

    // Create a query against the collection.
    const q = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(5)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    } else {
        return null;
    }
};

export const createUserProfile = async (user: User, nickname: string): Promise<void> => {
    const userRef = doc(db, 'users', user.uid);
    const newUser: UserProfile = {
        uid: user.uid,
        displayName: nickname,
        email: user.email || '',
        photoURL: user.photoURL || undefined,
        createdAt: Timestamp.now(),
    };
    await setDoc(userRef, newUser);
};

export const updateUserNickname = async (uid: string, nickname: string): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        displayName: nickname
    });
};

export const getUsers = async (uids: string[]): Promise<UserProfile[]> => {
    if (!uids || uids.length === 0) return [];

    // Using Promise.all for simplicity. For large lists, 'in' query batches would be better.
    const promises = uids.map(uid => getUserProfile(uid));
    const results = await Promise.all(promises);
    return results.filter((u): u is UserProfile => u !== null);
};
