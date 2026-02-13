import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    createdAt: Timestamp;
}

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
