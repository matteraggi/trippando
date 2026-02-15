import React from 'react';
import { ArrowLeft, MapPin, ChefHat, ExternalLink, MoreVertical, Trash2 } from 'lucide-react';
import type { Restaurant } from '../types/Restaurant';

interface RestaurantHeaderProps {
    restaurant: Restaurant;
    onBack: () => void;
    onMenuToggle: () => void;
    isMenuOpen: boolean;
    onCloseMenu: () => void;
    onDelete: () => void;
}

export default function RestaurantHeader({
    restaurant,
    onBack,
    onMenuToggle,
    isMenuOpen,
    onCloseMenu,
    onDelete
}: RestaurantHeaderProps) {

    // Close menu when clicking outside (simple implementation for now)
    React.useEffect(() => {
        if (isMenuOpen) {
            const handleClick = () => onCloseMenu();
            // Delay to avoid immediate close on toggle click
            setTimeout(() => document.addEventListener('click', handleClick), 0);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [isMenuOpen, onCloseMenu]);

    return (
        <div className="bg-white shadow-sm sticky top-0 z-20">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>

                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMenuToggle();
                        }}
                        className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MoreVertical size={24} className="text-gray-700" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white hover:bg-red-50  rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="w-full px-4 py-3 text-left flex items-center space-x-3 text-red-600"
                            >
                                <Trash2 size={18} />
                                <span>Elimina Ristorante</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Title & Info */}
            <div className="px-5 pb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{restaurant.name}</h1>
                        {restaurant.cuisineType && (
                            <div className="flex items-center text-orange-600 text-sm font-medium mt-1">
                                <ChefHat size={14} className="mr-1.5" />
                                <span className="capitalize">{restaurant.cuisineType}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-start space-x-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                    <div className="flex-1">
                        <p className="leading-snug">{restaurant.address}</p>
                    </div>
                    {restaurant.googleMapsLink && (
                        <a
                            href={restaurant.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white shadow-sm border border-gray-200 rounded-lg text-primary-600 hover:text-primary-700"
                        >
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
