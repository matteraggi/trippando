import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Note } from '../types/Note';

export const subscribeToNotes = (tripId: string, callback: (notes: Note[]) => void) => {
    const notesRef = collection(db, 'trips', tripId, 'notes');
    const q = query(notesRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Note[];
        callback(notes);
    });
};

export const addNote = async (tripId: string, note: { title: string; content: string; createdBy: string }) => {
    const notesRef = collection(db, 'trips', tripId, 'notes');
    await addDoc(notesRef, {
        ...note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

export const updateNote = async (tripId: string, noteId: string, note: { title: string; content: string }) => {
    const noteRef = doc(db, 'trips', tripId, 'notes', noteId);
    await updateDoc(noteRef, {
        ...note,
        updatedAt: serverTimestamp()
    });
};

export const deleteNote = async (tripId: string, noteId: string) => {
    const noteRef = doc(db, 'trips', tripId, 'notes', noteId);
    await deleteDoc(noteRef);
};
