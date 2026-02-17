import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { subscribeToTrips, createTrip } from '../services/tripService';
import type { Trip } from '../types/Trip';
import { Plus, Calendar, MapPin, User, Search } from 'lucide-react';
import { TRIP_ICONS } from '../constants/tripConstants';
import TripModal from '../components/TripModal';


const TripSkeleton = () => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4 animate-pulse">
        <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0"></div>
        <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    </div>
);

export default function Homepage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Subscribe to trips
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = subscribeToTrips(currentUser.uid, (updatedTrips) => {
            setTrips(updatedTrips);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleCreateTrip = async (data: { name: string; startDate: Date; endDate: Date; icon: string; color: string }) => {
        if (!currentUser) return;

        try {
            await createTrip(currentUser.uid, data);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to create trip", error);
            alert("Failed to create trip");
        }
    };

    const formatDateRange = (start: any, end: any) => {
        if (!start || !end) return '';
        const s = start.toDate();
        const e = end.toDate();
        return `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    };

    const getTripIcon = (iconName: string = 'MapPin') => {
        const found = TRIP_ICONS.find(i => i.name === iconName);
        const IconComponent = found ? found.icon : MapPin;
        return <IconComponent size={24} className="text-white" />;
    };

    return (
        <div className="min-h-full bg-gray-50 pb-24">
            {/* Header */}
            <header className="px-5 py-6 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-md z-10 transition-all">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Ciao{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}</p>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">I miei Viaggi</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-600/30 hover:scale-105 active:scale-95 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </header>

            {/* Trip List */}
            <main className="px-5 space-y-4">
                {/* Search Bar Placeholder */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Cerca viaggi..."
                        className="w-full bg-gray-200/50 pl-10 pr-4 py-2.5 pt-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-inset focus:ring-primary-600/50 transition-all text-sm font-medium"
                    />
                </div>

                {loading ? (
                    <>
                        <TripSkeleton />
                        <TripSkeleton />
                        <TripSkeleton />
                    </>
                ) : trips.length > 0 ? (
                    trips.map(trip => (
                        <div
                            key={trip.id}
                            onClick={() => navigate(`/trip/${trip.id}`)}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4 active:scale-[0.98] transition-transform cursor-pointer"
                        >
                            <div className={`w-16 h-16 rounded-xl ${trip.color || 'bg-primary-600'} flex items-center justify-center shrink-0 shadow-sm`}>
                                {getTripIcon(trip.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">{trip.name}</h3>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Calendar size={14} className="mr-1.5" />
                                    <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun viaggio</h3>
                        <p className="text-gray-500 text-sm px-10">Crea il tuo primo viaggio per tracciare le spese.</p>
                    </div>
                )}
            </main>

            <TripModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTrip}
                title="Nuovo Viaggio"
                buttonText="Crea Viaggio"
            />
        </div>
    );
}
