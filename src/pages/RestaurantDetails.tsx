import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToRestaurant } from '../services/restaurantService'; // Need to implement/export this
import type { Restaurant } from '../types/Restaurant';
import LoadingSpinner from '../components/LoadingSpinner';
import RestaurantHeader from '../components/RestaurantHeader';
import { Plus, Star, Wallet, Calendar } from 'lucide-react';
import { doc, deleteDoc, getFirestore } from 'firebase/firestore';

export default function RestaurantDetails() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!restaurantId || !currentUser) return;

        // Ensure we handle single document subscription
        // For now, if subscribeToRestaurant isn't available, we might need to use a direct query or update restaurantService
        // Assuming we will add subscribeToRestaurant to restaurantService
        const unsubscribe = subscribeToRestaurant(restaurantId, (data) => {
            setRestaurant(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [restaurantId, currentUser]);

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
                <LoadingSpinner size={32} color="#3B82F6" />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ristorante non trovato</h2>
                <button onClick={() => navigate('/restaurants')} className="text-blue-500 hover:underline">
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
                            {restaurant.averageRating ? restaurant.averageRating.toFixed(1) : '-'}
                        </span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                            <Calendar size={16} />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Visite</span>
                        <span className="text-lg font-bold text-gray-900">
                            {restaurant.visitCount || 0}
                        </span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                            <Wallet size={16} />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Spesa Media</span>
                        <span className="text-lg font-bold text-gray-900">
                            {restaurant.averagePrice ? `€${restaurant.averagePrice.toFixed(0)}` : '-'}
                        </span>
                    </div>
                </div>

                {/* Visits List Placeholder */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Diario Visite</h3>

                    {/* Empty State */}
                    {(!restaurant.visitCount || restaurant.visitCount === 0) ? (
                        <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 border-dashed">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Nessuna visita registrata</p>
                            <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto">
                                Tocca il pulsante + per aggiungere la tua prima esperienza qui.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* TODO: Map visits here */}
                            <p className="text-sm text-gray-500 italic text-center">Lista visite in arrivo...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => alert("Aggiungi visita (TODO)")}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-transform z-30"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}
