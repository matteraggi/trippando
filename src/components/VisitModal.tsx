import React, { useState } from 'react';
import { X, Calendar, DollarSign, Star, Plus, Trash2, Camera, MapPin, User, Utensils } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';

interface VisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export default function VisitModal({ isOpen, onClose, onSubmit }: VisitModalProps) {
    const { currentUser } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [totalCost, setTotalCost] = useState('');
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState('');
    const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
    const [newFriend, setNewFriend] = useState('');
    const [dishes, setDishes] = useState<{ name: string; rating: number }[]>([]);
    const [newDishName, setNewDishName] = useState('');
    const [newDishRating, setNewDishRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({
                date: Timestamp.fromDate(new Date(date)),
                totalCost: parseFloat(totalCost) || 0,
                rating,
                notes,
                taggedFriends,
                dishes,
                userId: currentUser?.uid
            });
            resetForm();
            onClose();
        } catch (error) {
            console.error("Error submitting visit:", error);
            alert("Errore nel salvataggio della visita.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setTotalCost('');
        setRating(0);
        setNotes('');
        setTaggedFriends([]);
        setDishes([]);
        setNewFriend('');
        setNewDishName('');
        setNewDishRating(0);
    };

    const handleAddFriend = () => {
        if (newFriend.trim()) {
            setTaggedFriends([...taggedFriends, newFriend.trim()]);
            setNewFriend('');
        }
    };

    const handleAddDish = () => {
        if (newDishName.trim()) {
            setDishes([...dishes, { name: newDishName.trim(), rating: newDishRating }]);
            setNewDishName('');
            setNewDishRating(0);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-900">Registra Visita</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">
                    <form id="visit-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Main Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Costo Totale (€)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={totalCost}
                                        onChange={(e) => setTotalCost(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Overall Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Voto Complessivo</label>
                            <div className="flex items-center space-x-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${rating >= star ? 'bg-yellow-400 text-white shadow-md scale-110' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{star}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                                <span>Pessimo</span>
                                <span>Eccellente</span>
                            </div>
                        </div>

                        {/* Dishes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Piatti Ordinati</label>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Nome piatto..."
                                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
                                    value={newDishName}
                                    onChange={(e) => setNewDishName(e.target.value)}
                                    // Submit on Enter
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddDish();
                                        }
                                    }}
                                />
                                <div className="flex items-center space-x-0.5 bg-gray-50 rounded-xl px-2 border border-gray-200">
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setNewDishRating(r)}
                                        >
                                            <Star size={16} className={`${newDishRating >= r ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddDish}
                                    className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                                    disabled={!newDishName.trim()}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {dishes.length > 0 && (
                                <div className="space-y-2">
                                    {dishes.map((dish, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center space-x-2">
                                                <Utensils size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-800">{dish.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {dish.rating > 0 && (
                                                    <div className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                                                        <Star size={10} className="fill-current mr-1" />
                                                        {dish.rating}
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setDishes(dishes.filter((_, idx) => idx !== i))}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tagged Friends */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Con chi eri? (Amici)</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Nome amico..."
                                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
                                    value={newFriend}
                                    onChange={(e) => setNewFriend(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddFriend();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddFriend}
                                    className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 disabled:opacity-50"
                                    disabled={!newFriend.trim()}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {taggedFriends.map((friend, i) => (
                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        <User size={12} className="mr-1.5 opacity-60" />
                                        {friend}
                                        <button
                                            type="button"
                                            onClick={() => setTaggedFriends(taggedFriends.filter(f => f !== friend))}
                                            className="ml-1.5 text-blue-400 hover:text-blue-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Note / Recensione</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                                placeholder="Com'era l'atmosfera? Servizio?"
                            />
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-gray-100 shrink-0">
                    <button
                        form="visit-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Salvataggio...' : 'Salva Visita'}
                    </button>
                </div>
            </div>
        </div>
    );
}
