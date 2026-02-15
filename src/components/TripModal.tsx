import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TRIP_ICONS, TRIP_COLORS } from '../constants/tripConstants';
import type { Trip } from '../types/Trip';
import LoadingSpinner from './LoadingSpinner';

interface TripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; startDate: Date; endDate: Date; icon: string; color: string }) => Promise<void>;
    initialData?: Trip;
    title: string;
    buttonText: string;
}

export default function TripModal({ isOpen, onClose, onSubmit, initialData, title, buttonText }: TripModalProps) {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Plane');
    const [selectedColor, setSelectedColor] = useState('bg-primary-500');
    const [loading, setLoading] = useState(false);

    const getDateString = (dateVal: any): string => {
        if (!dateVal) return '';
        if (dateVal instanceof Date) return dateVal.toISOString().split('T')[0];
        // Check for Firestore Timestamp (has toDate method)
        if (dateVal && typeof dateVal.toDate === 'function') {
            return dateVal.toDate().toISOString().split('T')[0];
        }
        if (typeof dateVal === 'string') return dateVal.split('T')[0];
        return '';
    };

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setStartDate(getDateString(initialData.startDate));
            setEndDate(getDateString(initialData.endDate));
            setSelectedIcon(initialData.icon || 'Plane');
            setSelectedColor(initialData.color || 'bg-primary-500');
        } else if (isOpen) {
            // Reset for new trip
            setName('');
            setStartDate('');
            setEndDate('');
            setSelectedIcon('Plane');
            setSelectedColor('bg-primary-500');
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                icon: selectedIcon,
                color: selectedColor
            });
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to save trip.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
            <div className="bg-white w-full sm:w-[450px] sm:rounded-2xl rounded-t-2xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-in sm:zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destinazione</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none text-lg font-medium"
                            placeholder="es. Parigi"
                            required
                        />
                    </div>

                    {/* Icon Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icona</label>
                        <div className="grid grid-cols-8 gap-2">
                            {TRIP_ICONS.map(item => {
                                const Icon = item.icon;
                                const isSelected = selectedIcon === item.name;
                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() => setSelectedIcon(item.name)}
                                        className={`aspect-square rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <Icon size={20} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Colore</label>
                        <div className="flex space-x-3 overflow-x-auto pb-4 pt-2 -mx-2 px-2 no-scrollbar">
                            {TRIP_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded-full shrink-0 ${color} transition-transform ${selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-105'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 active:scale-[0.98] transition-transform mt-4 disabled:bg-primary-400 flex justify-center items-center"
                    >
                        {loading ? <LoadingSpinner /> : buttonText}
                    </button>
                </form>
            </div>
        </div>
    );
}
