import React from 'react';
import { ChevronLeft, MoreHorizontal, Calendar, MapPin } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { TRIP_ICONS } from '../constants/tripConstants';
import { formatDate } from '../utils/dateUtils';
import type { Trip } from '../types/Trip';

interface TripHeaderProps {
    trip: Trip;
    onBack: () => void;
    onMenuToggle: () => void;
    isMenuOpen: boolean;
    onCloseMenu: () => void;
    onAddMember: () => void;
    onEditTrip: () => void;
    onDeleteTrip: () => void;
}

const TripHeader: React.FC<TripHeaderProps> = ({
    trip,
    onBack,
    onMenuToggle,
    isMenuOpen,
    onCloseMenu,
    onAddMember,
    onEditTrip,
    onDeleteTrip
}) => {
    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-md border-b border-gray-200 px-4 pt-4 pb-2">
                <div className="flex justify-between items-center">
                    <button
                        onClick={onBack}
                        className="flex items-center text-blue-500 font-medium -ml-2"
                    >
                        <ChevronLeft size={24} />
                        Indietro
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[60%]">
                        {trip.name}
                    </h1>
                    <div className="relative">
                        <button
                            onClick={onMenuToggle}
                            className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <MoreHorizontal size={24} />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={onAddMember}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <div className="w-8 flex justify-center"><LucideIcons.UserPlus size={16} /></div>
                                        Aggiungi Membro
                                    </button>
                                    <button
                                        onClick={onEditTrip}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <div className="w-8 flex justify-center"><LucideIcons.Edit2 size={16} /></div>
                                        Modifica Viaggio
                                    </button>
                                    <button
                                        onClick={onDeleteTrip}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                        <div className="w-8 flex justify-center"><LucideIcons.Trash2 size={16} /></div>
                                        Elimina Viaggio
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero / Info */}
            <div className={`relative h-48 ${trip.color || 'bg-blue-500'} w-full transition-colors duration-300`}>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="text-white">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                {(() => {
                                    const iconName = trip.icon || 'MapPin';
                                    const found = TRIP_ICONS.find(i => i.name === iconName);
                                    const IconComponent = found ? found.icon : MapPin;
                                    return <IconComponent size={24} className="text-white" />;
                                })()}
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-1 rounded">Viaggio</span>
                        </div>
                        <h2 className="text-3xl font-bold leading-tight mb-2">{trip.name}</h2>
                        <p className="text-sm font-medium opacity-90 flex items-center">
                            <Calendar size={14} className="mr-1.5" />
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TripHeader;
