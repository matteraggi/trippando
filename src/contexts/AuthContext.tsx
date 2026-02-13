import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';
import LoadingSpinner from '../components/LoadingSpinner';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    googleLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence)
            .catch((err) => {
                console.error("Auth persistence error:", err);
                setError(err.message);
            });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });



        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        error,
        login: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password).then(() => { }),
        signup: (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password).then(() => { }),
        logout: () => signOut(auth),
        googleLogin: () => signInWithPopup(auth, new GoogleAuthProvider()).then(() => { })
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
                    <LoadingSpinner size={40} color="#3B82F6" />
                </div>
            )}
        </AuthContext.Provider>
    );
}
