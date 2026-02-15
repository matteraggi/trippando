import React, { useState, useEffect } from 'react';
import { X, Search, User, UserPlus, Check } from 'lucide-react';
import { searchUsers, type UserProfile } from '../services/userService';
import { addTripMember } from '../services/tripService';
import LoadingSpinner from './LoadingSpinner';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    currentMembers: string[];
    onMemberAdded: () => void;
}

export default function AddMemberModal({ isOpen, onClose, tripId, currentMembers, onMemberAdded }: AddMemberModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length === 0) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const users = await searchUsers(searchTerm.trim());
                setResults(users);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleAddUser = async (user: UserProfile) => {
        if (adding) return;
        setAdding(user.uid);
        try {
            await addTripMember(tripId, user.uid);
            onMemberAdded();
        } catch (error) {
            console.error("Failed to add member", error);
            alert("Failed to add member");
        } finally {
            setAdding(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                    <h3 className="font-semibold text-gray-900">Aggiungi Membro</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cerca per nickname..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size={24} className="text-primary-500" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map(user => {
                                const isMember = currentMembers.includes(user.uid);
                                return (
                                    <div key={user.uid} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                                {user.displayName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.displayName}</p>
                                                {/* <p className="text-xs text-gray-400">User</p> */}
                                            </div>
                                        </div>

                                        {isMember ? (
                                            <button disabled className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-semibold flex items-center cursor-default">
                                                <Check size={14} className="mr-1" /> Aggiunto
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAddUser(user)}
                                                disabled={adding === user.uid}
                                                className="px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-xs font-semibold flex items-center transition-colors"
                                            >
                                                {adding === user.uid ? (
                                                    <LoadingSpinner size={14} className="text-primary-600" />
                                                ) : (
                                                    <>
                                                        <UserPlus size={14} className="mr-1" /> Aggiungi
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : searchTerm && !loading ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            <p>Nessun utente trovato per "{searchTerm}"</p>
                            <p className="text-xs mt-1">Prova un nickname diverso.</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-300">
                            <User size={48} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Scrivi per cercare utenti.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
