import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addVisit } from '../services/restaurantService';
import { Star, ArrowLeft, Calendar, Euro, Save } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export default function AddRestaurantVisit() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [rating, setRating] = useState(5);
    const [price, setPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurantId || !currentUser) return;

        setLoading(true);
        try {
            await addVisit(restaurantId, {
                userId: currentUser.uid,
                restaurantId,
                date: Timestamp.fromDate(new Date(date)),
                rating,
                totalPrice: parseFloat(price) || 0,
                notes,
            });
            navigate(-1);
        } catch (error) {
            console.error("Failed to add visit", error);
            alert("Errore durante il salvataggio della visita");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 ml-2">Nuova Visita</h1>
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
                            Salva Visita
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
