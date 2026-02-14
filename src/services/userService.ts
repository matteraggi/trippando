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


export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];

    // Fetch a broader set of users for client-side filtering. 
    // Optimization: In a real app, this should be paginated or use a dedicated search service (Algolia/Elastic).
    // For now, fetching recent 100 users is a reasonable compromise for this scale.
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(100)); // Fetches "all" or up to 100 users

    const querySnapshot = await getDocs(q);
    const allUsers = querySnapshot.docs.map(doc => doc.data() as UserProfile);

    // Client-side Filter & Sort
    const filtered = allUsers.filter(user => {
        const name = user.displayName.toLowerCase();
        return name.includes(term); // Fuzzy: just needs to contain the string
    });

    // Sort by relevance:
    // 1. Exact match
    // 2. Starts with
    // 3. Contains
    return filtered.sort((a, b) => {
        const nameA = a.displayName.toLowerCase();
        const nameB = b.displayName.toLowerCase();

        // Exact match priority
        if (nameA === term && nameB !== term) return -1;
        if (nameB === term && nameA !== term) return 1;

        // "Starts with" priority
        const startsA = nameA.startsWith(term);
        const startsB = nameB.startsWith(term);
        if (startsA && !startsB) return -1;
        if (startsB && !startsA) return 1;

        // Alphabetical fallback
        return nameA.localeCompare(nameB);
    });
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

    const promises = uids.map(uid => getUserProfile(uid));
    const results = await Promise.all(promises);
    return results.filter((u): u is UserProfile => u !== null);
};
