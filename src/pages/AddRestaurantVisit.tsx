import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addVisit, getVisit, updateVisit } from '../services/restaurantService';
import { searchUsers, getUsers, type UserProfile } from '../services/userService';
import { Star, ArrowLeft, Calendar, Euro, Save, User, Plus, X, Search, Check } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AddRestaurantVisit() {
    const { restaurantId, visitId } = useParams<{ restaurantId: string; visitId?: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isEditing = !!visitId;

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [rating, setRating] = useState(5);
    const [price, setPrice] = useState('');
    const [notes, setNotes] = useState('');

    // Friends Tagging State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [taggedUsers, setTaggedUsers] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Fetch existing visit data if editing
    useEffect(() => {
        if (!restaurantId || !visitId) return;

        const loadVisit = async () => {
            setFetching(true);
            try {
                const visit = await getVisit(restaurantId, visitId);
                if (visit) {
                    setDate(visit.date instanceof Timestamp ? visit.date.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
                    setRating(visit.rating);
                    setPrice(visit.totalPrice?.toString() || '');
                    setNotes(visit.notes || '');

                    // Fetch profiles for tagged friends
                    if (visit.taggedFriends && visit.taggedFriends.length > 0) {
                        try {
                            const profiles = await getUsers(visit.taggedFriends);
                            setTaggedUsers(profiles);
                        } catch (err) {
                            console.error("Error fetching tagged users", err);
                        }
                    }
                } else {
                    alert("Visita non trovata");
                    navigate(-1);
                }
            } catch (error) {
                console.error("Error loading visit", error);
                alert("Errore nel caricamento della visita");
            } finally {
                setFetching(false);
            }
        };

        loadVisit();
    }, [restaurantId, visitId, navigate]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length === 0) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const users = await searchUsers(searchTerm.trim());
                setSearchResults(users);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleAddUser = (user: UserProfile) => {
        if (!taggedUsers.find(u => u.uid === user.uid)) {
            setTaggedUsers([...taggedUsers, user]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleRemoveUser = (uid: string) => {
        setTaggedUsers(taggedUsers.filter(u => u.uid !== uid));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurantId || !currentUser) return;

        setLoading(true);
        try {
            const visitData = {
                userId: currentUser.uid,
                restaurantId,
                date: Timestamp.fromDate(new Date(date)),
                rating,
                totalPrice: parseFloat(price) || 0,
                notes,
                taggedFriends: taggedUsers.map(u => u.uid),
            };

            if (isEditing && visitId) {
                await updateVisit(restaurantId, visitId, visitData);
            } else {
                await addVisit(restaurantId, visitData);
            }
            navigate(-1);
        } catch (error) {
            console.error("Failed to save visit", error);
            alert("Errore durante il salvataggio della visita");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-50 pb-safe">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 ml-2">
                    {isEditing ? 'Modifica Visita' : 'Nuova Visita'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Date Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar size={18} className="text-primary-600" />
                        Data
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full text-lg p-2 border-b-2 border-gray-200 focus:border-primary-600 outline-none bg-transparent transition-colors"
                        required
                    />
                </div>

                {/* Rating Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                        <Star size={18} className="text-yellow-500" />
                        Valutazione
                    </label>
                    <div className="flex justify-between px-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform active:scale-90"
                            >
                                <Star
                                    size={36}
                                    className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} transition-colors`}
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-500 font-medium">
                        {rating === 1 && "Pessimo"}
                        {rating === 2 && "Scarso"}
                        {rating === 3 && "Nella media"}
                        {rating === 4 && "Buono"}
                        {rating === 5 && "Eccellente"}
                    </div>
                </div>

                {/* Price Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Euro size={18} className="text-green-500" />
                        Spesa Totale
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            inputMode="decimal"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            className="w-full text-3xl font-bold p-2 pl-8 border-b-2 border-gray-200 focus:border-green-500 outline-none bg-transparent transition-colors"
                            required
                            min="0"
                            step="0.01"
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xl text-gray-400">€</span>
                    </div>
                </div>

                {/* Tagged Friends Section (User Search) */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <User size={18} className="text-primary-600" />
                        Con chi eri?
                    </label>

                    {/* Search Input */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Cerca amici..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <LoadingSpinner size={16} className="text-primary-500" />
                            </div>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchTerm.trim().length > 0 && searchResults.length > 0 && (
                        <div className="mb-3 max-h-40 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/50">
                            {searchResults.map(user => {
                                const isSelected = taggedUsers.some(u => u.uid === user.uid);
                                return (
                                    <button
                                        key={user.uid}
                                        type="button"
                                        onClick={() => !isSelected && handleAddUser(user)}
                                        className={`w-full flex items-center justify-between p-2 hover:bg-white transition-colors text-left ${isSelected ? 'opacity-50 cursor-default' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                {user.displayName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
                                        </div>
                                        {isSelected && <Check size={14} className="text-green-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Selected Users Chips */}
                    <div className="flex flex-wrap gap-2">
                        {taggedUsers.map((user) => (
                            <span key={user.uid} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-600 border border-primary-100">
                                <User size={12} className="mr-1.5 opacity-60" />
                                {user.displayName}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveUser(user.uid)}
                                    className="ml-1.5 text-primary-400 hover:text-primary-600"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Cosa hai mangiato? Com'era il servizio?"
                        className="w-full p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-100 min-h-[120px] resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save size={24} />
                            {isEditing ? 'Aggiorna Visita' : 'Salva Visita'}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
