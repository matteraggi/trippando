import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToRestaurant, subscribeToVisits } from '../services/restaurantService';
import type { Restaurant, Visit } from '../types/Restaurant';
import LoadingSpinner from '../components/LoadingSpinner';
import RestaurantHeader from '../components/RestaurantHeader';
import { Plus, Star, Wallet, Calendar, User } from 'lucide-react';
import { doc, deleteDoc, getFirestore } from 'firebase/firestore';

export default function RestaurantDetails() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!restaurantId || !currentUser) return;

        const unsubscribeRestaurant = subscribeToRestaurant(restaurantId, (data) => {
            setRestaurant(data);
            setLoading(false);
        });

        const unsubscribeVisits = subscribeToVisits(restaurantId, (data) => {
            setVisits(data);
        });

        return () => {
            unsubscribeRestaurant();
            unsubscribeVisits();
        };
    }, [restaurantId, currentUser]);

    const stats = useMemo(() => {
        if (!visits.length) return { avgRating: 0, avgPrice: 0, count: 0 };

        const totalRating = visits.reduce((acc, v) => acc + (v.rating || 0), 0);
        const totalPrice = visits.reduce((acc, v) => acc + (v.totalPrice || 0), 0);

        return {
            avgRating: totalRating / visits.length,
            avgPrice: totalPrice / visits.length,
            count: visits.length
        };
    }, [visits]);

    const handleDelete = async () => {
        if (!restaurantId || !window.confirm("Sei sicuro di voler eliminare questo ristorante?")) return;
        try {
            const db = getFirestore();
            await deleteDoc(doc(db, "restaurants", restaurantId));
            navigate('/restaurants');
        } catch (error) {
            console.error("Failed to delete restaurant", error);
            alert("Errore durante l'eliminazione");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner size={32} className="text-primary-600" />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ristorante non trovato</h2>
                <button onClick={() => navigate('/restaurants')} className="text-primary-600 hover:underline">
                    Torna alla lista
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <RestaurantHeader
                restaurant={restaurant}
                onBack={() => navigate('/restaurants')}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                isMenuOpen={isMenuOpen}
                onCloseMenu={() => setIsMenuOpen(false)}
                onDelete={handleDelete}
            />

            <div className="px-4 py-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-2">
                            <Star size={16} className="fill-current" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Media Voto</span>
                        <span className="text-lg font-bold text-gray-900">
                            {stats.avgRating ? stats.avgRating.toFixed(1) : '-'}
                        </span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-2">
                            <Calendar size={16} />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Visite</span>
                        <span className="text-lg font-bold text-gray-900">
                            {stats.count}
                        </span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                            <Wallet size={16} />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Spesa Media</span>
                        <span className="text-lg font-bold text-gray-900">
                            {stats.avgPrice ? `€${stats.avgPrice.toFixed(0)}` : '-'}
                        </span>
                    </div>
                </div>

                {/* Visits List */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Diario Visite ({stats.count})</h3>

                    {visits.length === 0 && loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size={24} color="#9CA3AF" />
                        </div>
                    ) : visits.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 border-dashed">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Nessuna visita registrata</p>
                            <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto">
                                Tocca il pulsante + per aggiungere la tua prima esperienza qui.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {visits.map((visit) => (
                                <div key={visit.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">
                                                {visit.date?.toDate().toLocaleDateString('it-IT', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            {/* Rating Badge */}
                                            <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400 mr-1" />
                                                <span className="text-xs font-bold text-yellow-700">{visit.rating}</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-900">€{visit.totalPrice?.toFixed(2)}</span>
                                    </div>

                                    {visit.notes && (
                                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg mt-2">
                                            {visit.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate(`/restaurants/${restaurantId}/add-visit`)}
                className="fixed bottom-6 right-6 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-600/30 hover:scale-105 active:scale-95 transition-transform z-30"
            >
                <Plus size={24} />
            </button>
        </div>
    );
}
