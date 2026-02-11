import React from 'react';

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Profile() {
    const { currentUser, logout } = useAuth()!;
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch {
            console.error('Failed to log out');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-10 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Profile</h1>
                <div className="w-8"></div> {/* Spacer for alignment */}
            </div>

            <div className="p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2 px-1">User Info</h2>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                        <span className="text-gray-900">Email</span>
                        <span className="text-gray-500">{currentUser?.email}</span>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 px-4 border border-red-500 rounded-md shadow-sm text-sm font-medium text-red-500 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
