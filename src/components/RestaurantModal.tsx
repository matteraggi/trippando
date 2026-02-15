import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Map, ChevronDown, Check, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToTrips } from '../services/tripService';
import { searchPlaces, type PlaceResult } from '../services/locationService';
import { TRIP_ICONS } from '../constants/tripConstants';
import type { Trip } from '../types/Trip';

interface RestaurantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        address: string;
        tripId?: string;
        googleMapsLink?: string;
        coordinates?: { lat: number; lng: number };
        city?: string;
        country?: string;
        cuisineType?: string;
    }) => void;
}

export default function RestaurantModal({ isOpen, onClose, onSubmit }: RestaurantModalProps) {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [selectedTripId, setSelectedTripId] = useState<string>('');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [googleMapsLink, setGoogleMapsLink] = useState('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>();
    const [selectedPlaceData, setSelectedPlaceData] = useState<{ city?: string; country?: string; type?: string }>({});

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Custom Dropdown State
    const [isTripDropdownOpen, setIsTripDropdownOpen] = useState(false);
    const tripDropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!currentUser || !isOpen) return;
        const unsubscribe = subscribeToTrips(currentUser.uid, (data) => {
            setTrips(data);
        });
        return () => unsubscribe();
    }, [currentUser, isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tripDropdownRef.current && !tripDropdownRef.current.contains(event.target as Node)) {
                setIsTripDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Search Debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchQuery.length >= 3) {
            setIsSearching(true);
            searchTimeoutRef.current = setTimeout(async () => {
                const results = await searchPlaces(searchQuery);
                setSearchResults(results);
                setIsSearching(false);
                setShowResults(true);
            }, 800); // 800ms throttle to be nice to Nominatim
        } else {
            setSearchResults([]);
            setShowResults(false);
            setIsSearching(false);
        }

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery]);

    if (!isOpen) return null;



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: name || searchQuery,
            address,
            tripId: selectedTripId || undefined,
            googleMapsLink,
            coordinates,
            city: selectedPlaceData.city,
            country: selectedPlaceData.country,
            cuisineType: selectedPlaceData.type
        });
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setAddress('');
        setGoogleMapsLink('');
        setCoordinates(undefined);
        setSelectedPlaceData({});
        setSearchQuery('');
        setSearchResults([]);
        setSelectedTripId('');
        setIsTripDropdownOpen(false);
        setShowResults(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSelectPlace = (place: PlaceResult) => {
        // 1. Name: Use 'name' field if available, otherwise first part of display_name
        let placeName = place.name;
        if (!placeName) {
            placeName = place.display_name.split(',')[0];
        }

        // 2. Address: Construct from structured address fields if available
        let placeAddress = '';
        let city = '';
        let country = '';

        if (place.address) {
            const { road, house_number, city: cityVal, town, village, postcode, country: countryVal } = place.address;

            const streetPart = [road, house_number].filter(Boolean).join(' ');
            const cityPart = [postcode, cityVal || town || village].filter(Boolean).join(' ');

            // Format: "Via Roma 1, 40100 Bologna"
            placeAddress = [streetPart, cityPart, countryVal].filter(Boolean).join(', ');

            city = cityVal || town || village || '';
            country = countryVal || '';
        } else {
            // Fallback to slicing display_name
            placeAddress = place.display_name.split(', ').slice(1).join(', ');
        }

        // 3. Type/Cuisine: Try to map 'type' (e.g., 'fast_food', 'italian')
        // This is a naive mapping, we might want a translation map later
        const placeType = place.type !== 'yes' ? place.type.replace('_', ' ') : '';

        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

        setName(placeName);
        setAddress(placeAddress);
        setGoogleMapsLink(mapLink);
        setCoordinates({ lat, lng });

        setSearchQuery('');
        setShowResults(false);
        setSelectedPlaceData({ city, country, type: placeType });
    };



    const selectedTrip = trips.find(t => t.id === selectedTripId);

    const getTripIcon = (iconName?: string) => {
        const found = TRIP_ICONS.find(i => i.name === iconName);
        const IconComponent = found ? found.icon : Map;
        return <IconComponent size={16} />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={handleClose} />
            <div className="bg-white w-full sm:w-[450px] sm:rounded-2xl rounded-t-2xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-in sm:zoom-in-95 duration-200 flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Nuovo Ristorante</h2>
                    <button onClick={handleClose} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 overflow-visible">
                    {/* Search Field */}
                    <div className="relative z-40">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cerca Luogo (OpenStreetMap)</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="Cerca ristorante..."
                                autoFocus
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                    <Loader2 className="text-primary-500 animate-spin" size={18} />
                                </div>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto divide-y divide-gray-50">
                                {searchResults.map((place) => (
                                    <button
                                        key={place.place_id}
                                        onClick={() => handleSelectPlace(place)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3 transition-colors"
                                    >
                                        <MapPin size={16} className="mt-1 text-gray-400 shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{place.display_name.split(',')[0]}</p>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{place.display_name.split(',').slice(1).join(',')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative border-t border-gray-100 pt-4">
                        <p className="text-xs text-gray-400 mb-4 text-center uppercase tracking-wider font-medium">Oppure inserisci manualmente</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Ristorante</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                                placeholder="Es. Da Mario"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Via Roma 1"
                                />
                            </div>
                        </div>

                        <div className="relative" ref={tripDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salva nel Viaggio (Opzionale)</label>

                            <div
                                onClick={() => setIsTripDropdownOpen(!isTripDropdownOpen)}
                                className={`w-full pl-3 pr-4 py-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${isTripDropdownOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <div className="flex items-center truncate">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-white shrink-0 ${selectedTrip ? (selectedTrip.color || 'bg-primary-500') : 'bg-gray-100 text-gray-400'}`}>
                                        {selectedTrip ? getTripIcon(selectedTrip.icon) : <Map size={16} />}
                                    </div>
                                    <span className={`truncate ${selectedTrip ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                        {selectedTrip ? selectedTrip.name : 'Seleziona un viaggio...'}
                                    </span>
                                </div>
                                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isTripDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown Options */}
                            {isTripDropdownOpen && (
                                <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                                    <div
                                        onClick={() => {
                                            setSelectedTripId('');
                                            setIsTripDropdownOpen(false);
                                        }}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center text-gray-500 border-b border-gray-50"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3 text-gray-400">
                                            <X size={16} />
                                        </div>
                                        <span>Nessun viaggio</span>
                                        {selectedTripId === '' && <Check size={16} className="ml-auto text-primary-500" />}
                                    </div>

                                    {trips.map(trip => (
                                        <div
                                            key={trip.id}
                                            onClick={() => {
                                                setSelectedTripId(trip.id);
                                                setIsTripDropdownOpen(false);
                                            }}
                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center"
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-white shrink-0 ${trip.color || 'bg-primary-500'}`}>
                                                {getTripIcon(trip.icon)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{trip.name}</p>
                                            </div>
                                            {selectedTripId === trip.id && <Check size={16} className="ml-auto text-primary-500" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-700 active:scale-[0.98] transition-all"
                            >
                                Aggiungi Ristorante
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
