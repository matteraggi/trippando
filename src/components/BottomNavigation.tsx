
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map, Utensils, User } from 'lucide-react';

export default function BottomNavigation() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/home', icon: Map, label: 'Viaggi' },
        { path: '/restaurants', icon: Utensils, label: 'Ristoranti' },
        { path: '/profile', icon: User, label: 'Profilo' }
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
        >
            <div className="flex justify-around items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center w-16 py-2 transition-all duration-200 ${active ? 'text-primary-600 scale-105' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
                            <span className={`text-[10px] font-medium mt-1 ${active ? 'opacity-100' : 'opacity-0'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
