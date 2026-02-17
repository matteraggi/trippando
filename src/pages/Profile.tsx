import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, LogOut, Edit2, Check, X, Map, Utensils } from 'lucide-react';
import { getUserProfile, updateUserNickname } from '../services/userService';
import { subscribeToTrips } from '../services/tripService';
import { subscribeToRestaurants } from '../services/restaurantService';
import type { UserProfile } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [updatingNickname, setUpdatingNickname] = useState(false);

    // Stats State
    const [tripsCount, setTripsCount] = useState<number | null>(null);
    const [restaurantsCount, setRestaurantsCount] = useState<number | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        const loadData = async () => {
            // 1. Load Profile
            try {
                const userProfile = await getUserProfile(currentUser.uid);
                if (userProfile) {
                    setProfile(userProfile);
                    setNickname(userProfile.displayName || '');
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoadingProfile(false);
            }
        };
        loadData();

        // 2. Subscribe to Stats
        const unsubscribeTrips = subscribeToTrips(currentUser.uid, (trips) => {
            setTripsCount(trips.length);
        });

        const unsubscribeRestaurants = subscribeToRestaurants(currentUser.uid, (restaurants) => {
            setRestaurantsCount(restaurants.length);
        });

        return () => {
            unsubscribeTrips();
            unsubscribeRestaurants();
        };
    }, [currentUser]);


    const handleSaveNickname = async () => {
        if (!currentUser || !nickname.trim()) return;
        setUpdatingNickname(true);
        try {
            await updateUserNickname(currentUser.uid, nickname.trim());
            setProfile(prev => prev ? { ...prev, displayName: nickname.trim() } : null);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update nickname", error);
            alert("Failed to update nickname");
        } finally {
            setUpdatingNickname(false);
        }
    };

    const handleLogout = async () => {
        if (!window.confirm("Sei sicuro di voler uscire?")) return;
        try {
            await logout();
            navigate('/login');
        } catch {
            console.error('Failed to log out');
        }
    };

    if (!currentUser) return null;

    if (loadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-full bg-gray-50">
                <LoadingSpinner size={32} className="text-primary-500" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 gap-4">
            <header className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profilo</h1>
            </header>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shrink-0">
                <div className="h-24 bg-gradient-to-r from-primary-500 to-indigo-600 relative">
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="relative">
                            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 pb-4 px-4 text-center">
                    {isEditing ? (
                        <div className="flex items-center justify-center space-x-2 mb-1">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-center font-bold text-gray-900 focus:ring-2 focus:ring-primary-600 outline-none w-40 text-sm"
                                placeholder="Il tuo nickname"
                                autoFocus
                            />
                            <button
                                onClick={handleSaveNickname}
                                disabled={updatingNickname}
                                className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                            >
                                {updatingNickname ? <LoadingSpinner size={14} /> : <Check size={14} />}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setNickname(profile?.displayName || '');
                                }}
                                className="p-1.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center space-x-2 mb-0.5">
                            <h2 className="text-xl font-bold text-gray-900">
                                {profile?.displayName || 'Utente senza nome'}
                            </h2>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                            >
                                <Edit2 size={14} />
                            </button>
                        </div>
                    )}
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
                {/* Trips Stat */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-1">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Map size={16} />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">
                            {tripsCount !== null ? tripsCount : <div className="h-6 w-6 bg-gray-200 rounded animate-pulse inline-block"></div>}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Viaggi</p>
                    </div>
                </div>

                {/* Restaurants Stat */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-1">
                    <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                        <Utensils size={16} />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">
                            {restaurantsCount !== null ? restaurantsCount : <div className="h-6 w-6 bg-gray-200 rounded animate-pulse inline-block"></div>}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Ristoranti</p>
                    </div>
                </div>
            </div>

            {/* Spacer to push logout to bottom if needed, or just let it sit */}
            <div className="flex-1"></div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden shrink-0 mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <LogOut size={16} />
                    </div>
                    <span className="font-medium text-sm">Esci dall'account</span>
                </button>
            </div>

            <div className="text-center text-[10px] text-gray-400 pb-2 shrink-0">
                Trippando v1.0.0
            </div>
        </div>
    );
}
