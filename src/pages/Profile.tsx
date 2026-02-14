import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, LogOut, Edit2, Check, X, Camera } from 'lucide-react';
import { getUserProfile, updateUserNickname } from '../services/userService';
import type { UserProfile } from '../services/userService';

export default function Profile() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadProfile();
        }
    }, [currentUser]);

    const loadProfile = async () => {
        if (!currentUser) return;
        try {
            const userProfile = await getUserProfile(currentUser.uid);
            if (userProfile) {
                setProfile(userProfile);
                setNickname(userProfile.displayName || '');
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const handleSaveNickname = async () => {
        if (!currentUser || !nickname.trim()) return;
        setLoading(true);
        try {
            await updateUserNickname(currentUser.uid, nickname.trim());
            setProfile(prev => prev ? { ...prev, displayName: nickname.trim() } : null);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update nickname", error);
            alert("Failed to update nickname");
        } finally {
            setLoading(false);
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

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="px-5 py-6 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-md z-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profilo</h1>
                </div>
            </header>

            <div className="p-4 space-y-6">

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                            <div className="relative">
                                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                        {currentUser.photoURL ? (
                                            <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={40} className="text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                {/* Camera icon placeholder for future photo upload feature */}
                                {/* <button className="absolute bottom-0 right-0 p-1.5 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors">
                                    <Camera size={14} />
                                </button> */}
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 pb-6 px-4 text-center">
                        {isEditing ? (
                            <div className="flex items-center justify-center space-x-2 mb-1">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-center font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none w-48"
                                    placeholder="Il tuo nickname"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveNickname}
                                    disabled={loading}
                                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNickname(profile?.displayName || '');
                                    }}
                                    className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2 mb-1">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {profile?.displayName || 'Utente senza nome'}
                                </h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center p-4 text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                            <LogOut size={20} />
                        </div>
                        <span className="font-medium">Esci dall'account</span>
                    </button>
                </div>

                <div className="text-center text-xs text-gray-400 pt-8">
                    Trippando v1.0.0
                </div>
            </div>
        </div>
    );
}
