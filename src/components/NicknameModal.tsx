import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, createUserProfile } from '../services/userService';
import { updateProfile } from 'firebase/auth';
import LoadingSpinner from './LoadingSpinner';

export default function NicknameModal() {
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkUserProfile = async () => {
            if (!currentUser) {
                setChecking(false);
                return;
            }

            try {
                const userProfile = await getUserProfile(currentUser.uid);
                if (!userProfile) {
                    // Start with existing display name if available
                    setNickname(currentUser.displayName || '');
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Error checking user profile:", error);
            } finally {
                setChecking(false);
            }
        };

        checkUserProfile();
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !nickname.trim()) return;

        setLoading(true);
        try {
            // 1. Update Firestore
            await createUserProfile(currentUser, nickname.trim());

            // 2. Update Firebase Auth Profile (for immediate UI consistency)
            await updateProfile(currentUser, { displayName: nickname.trim() });

            // 3. Close modal
            setIsOpen(false);

            window.location.reload();
        } catch (error) {
            console.error("Failed to save nickname:", error);
            alert("Failed to save nickname. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (checking || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Welcome to Trippando! 👋</h2>
                    <p className="text-gray-500 text-sm mt-2">Please choose a nickname to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                            Nickname
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="e.g. Maverick"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                            autoFocus
                            required
                            minLength={2}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !nickname.trim()}
                        className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <LoadingSpinner size={20} color="#ffffff" /> : "Get Started"}
                    </button>
                </form>
            </div>
        </div>
    );
}
