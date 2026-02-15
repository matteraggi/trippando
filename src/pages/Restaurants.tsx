import React, { useEffect, useState } from 'react';
import { ChefHat, Plus, MapPin, Search, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToRestaurants, addRestaurant } from '../services/restaurantService';
import type { Restaurant } from '../types/Restaurant';
import RestaurantModal from '../components/RestaurantModal';
import { useNavigate } from 'react-router-dom';

export default function Restaurants() {
    const { currentUser } = useAuth();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = subscribeToRestaurants(currentUser.uid, (data) => {
            setRestaurants(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleAddRestaurant = async (data: {
        name: string;
        address: string;
        tripId?: string;
        googleMapsLink?: string;
        coordinates?: { lat: number; lng: number };
    }) => {
        if (!currentUser) return;
        try {
            await addRestaurant(currentUser.uid, data);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to add restaurant", error);
            alert("Failed to add restaurant");
        }
    };

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="px-5 py-6 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-md z-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ristoranti</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Il tuo diario del gusto.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </header>

            <main className="px-5 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cerca ristorante o cucina..."
                        className="w-full bg-gray-200/50 pl-10 pr-4 py-2.5 pt-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50 transition-all text-sm font-medium"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Caricamento...</div>
                ) : filteredRestaurants.length > 0 ? (
                    <div className="space-y-3">
                        {filteredRestaurants.map(restaurant => (
                            <div
                                key={restaurant.id}
                                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                                className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 active:scale-[0.98] transition-transform cursor-pointer"
                            >
                                {/* Left Icon */}
                                <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-orange-600">
                                    <ChefHat size={24} />
                                </div>

                                {/* Center Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-base font-bold text-gray-900 truncate pr-2">{restaurant.name}</h3>

                                        {/* Rating Badge */}
                                        {restaurant.averageRating !== undefined && restaurant.averageRating > 0 && (
                                            <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg shrink-0">
                                                <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                                                <span className="text-xs font-bold text-gray-700">{restaurant.averageRating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Address / Subtext */}
                                    <div className="flex items-center text-gray-500 text-xs mt-1">
                                        <MapPin size={12} className="mr-1 shrink-0" />
                                        <span className="truncate block">{restaurant.address || 'Nessun indirizzo'}</span>
                                    </div>

                                    {/* Stats */}
                                    {(restaurant.visitCount || restaurant.averagePrice) ? (
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {restaurant.visitCount !== undefined && restaurant.visitCount > 0 && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                    {restaurant.visitCount} visite
                                                </span>
                                            )}
                                            {restaurant.averagePrice !== undefined && restaurant.averagePrice > 0 && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                    €{restaurant.averagePrice.toFixed(0)}
                                                </span>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ChefHat size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun ristorante</h3>
                        <p className="max-w-xs text-sm">Aggiungi il tuo primo ristorante per iniziare a tracciare le tue esperienze culinarie.</p>
                    </div>
                )}
            </main>

            <RestaurantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddRestaurant}
            />
        </div>
    );
}
