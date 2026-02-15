import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, MapPin, Star } from 'lucide-react';
import { subscribeToVisits } from '../services/restaurantService';
import type { Restaurant, Visit } from '../types/Restaurant';

interface RestaurantListItemProps {
    restaurant: Restaurant;
}

export default function RestaurantListItem({ restaurant }: RestaurantListItemProps) {
    const navigate = useNavigate();
    const [visits, setVisits] = useState<Visit[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToVisits(restaurant.id, (data) => {
            setVisits(data);
        });
        return () => unsubscribe();
    }, [restaurant.id]);

    const stats = useMemo(() => {
        if (!visits.length) return null;

        const totalRating = visits.reduce((acc, v) => acc + (v.rating || 0), 0);

        return {
            avgRating: totalRating / visits.length,
            count: visits.length
        };
    }, [visits]);

    return (
        <div
            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
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
                    {stats && stats.avgRating > 0 && (
                        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg shrink-0">
                            <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                            <span className="text-xs font-bold text-gray-700">{stats.avgRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Address */}
                <div className="flex items-center text-gray-500 text-xs mt-1">
                    <MapPin size={12} className="mr-1 shrink-0" />
                    <span className="truncate block">{restaurant.address || 'Nessun indirizzo'}</span>
                </div>

                {/* Stats Footer */}
                {stats && stats.count > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {stats.count} {stats.count === 1 ? 'visita' : 'visite'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
