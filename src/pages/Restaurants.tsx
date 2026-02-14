
import React from 'react';
import { ChefHat } from 'lucide-react';

export default function Restaurants() {
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="px-5 py-6 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-md z-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ristoranti</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Il tuo diario del gusto.</p>
                </div>
            </header>

            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ChefHat size={40} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Presto in arrivo</h3>
                <p className="max-w-xs">Qui potrai salvare tutti i ristoranti che visiti e dargli un voto.</p>
            </div>
        </div>
    );
}
