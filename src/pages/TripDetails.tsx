import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, MoreHorizontal, ShoppingBag, Coffee, Car, Bed, Activity, Tag, Trash2, Edit2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { subscribeToTrip, updateTrip, deleteTrip } from '../services/tripService';
import { subscribeToExpenses } from '../services/expenseService';
import { getUsers } from '../services/userService';
import type { Trip } from '../types/Trip';
import type { Expense } from '../types/Expense';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { TRIP_ICONS } from '../constants/tripConstants';
import TripModal from '../components/TripModal';
import AddMemberModal from '../components/AddMemberModal';
import LoadingSpinner from '../components/LoadingSpinner';

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Food': return <Coffee size={20} />;
        case 'Transport': return <Car size={20} />;
        case 'Hotel': return <Bed size={20} />;
        case 'Activity': return <Activity size={20} />;
        case 'Shopping': return <ShoppingBag size={20} />;
        default: return <Tag size={20} />;
    }
};

export default function TripDetails() {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

    // ... useEffect ...

    const handleUpdateTrip = async (data: any) => {
        if (!tripId) return;
        try {
            await updateTrip(tripId, data);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update trip", error);
            alert("Failed to update trip");
        }
    };

    const handleDeleteTrip = async () => {
        if (!tripId || !window.confirm("Are you sure you want to delete this trip? All expenses will be deleted.")) return;
        try {
            await deleteTrip(tripId);
            navigate('/');
        } catch (error) {
            console.error("Failed to delete trip", error);
            alert("Failed to delete trip");
        }
    };



    // ...

    const [memberNames, setMemberNames] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!tripId) return;

        const unsubscribeTrip = subscribeToTrip(tripId, (tripData) => {
            setTrip(tripData);
            setLoading(false);

            // Fetch member names when trip data is loaded
            if (tripData && tripData.members && tripData.members.length > 0) {
                getUsers(tripData.members).then(users => {
                    const names: Record<string, string> = {};
                    users.forEach(u => names[u.uid] = u.displayName);
                    setMemberNames(names);
                });
            }
        });

        const unsubscribeExpenses = subscribeToExpenses(tripId, (expenseList) => {
            setExpenses(expenseList);
        });

        return () => {
            unsubscribeTrip();
            unsubscribeExpenses();
        };
    }, [tripId]);

    const calculateTotals = () => {
        const totals: Record<string, number> = {};
        expenses.forEach(exp => {
            totals[exp.currency] = (totals[exp.currency] || 0) + exp.amount;
        });
        return Object.entries(totals).map(([curr, amount]) => `${amount.toFixed(2)} ${curr}`).join(' + ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner size={32} color="#3B82F6" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-blue-500 hover:underline"
                >
                    Go back home
                </button>
            </div>
        );
    }

    // Security check: Ensure user is a member
    if (currentUser && !trip.members.includes(currentUser.uid)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
                <p className="text-gray-600">You are not a member of this trip.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-blue-500">Go Back</button>
            </div>
        )
    }

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return '';
        return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatExpenseDate = (timestamp: Timestamp) => {
        if (!timestamp) return '';
        return timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-md border-b border-gray-200 px-4 pt-4 pb-2">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-blue-500 font-medium -ml-2"
                    >
                        <ChevronLeft size={24} />
                        Back
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[60%]">
                        {trip.name}
                    </h1>
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <MoreHorizontal size={24} />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsAddMemberModalOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <div className="w-8 flex justify-center"><LucideIcons.UserPlus size={16} /></div>
                                        Add Member
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <div className="w-8 flex justify-center"><LucideIcons.Edit2 size={16} /></div>
                                        Edit Trip
                                    </button>
                                    <button
                                        onClick={handleDeleteTrip}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                        <div className="w-8 flex justify-center"><LucideIcons.Trash2 size={16} /></div>
                                        Delete Trip
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
                            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-1 rounded">Trip</span>
                        </div>
                        <h2 className="text-3xl font-bold leading-tight mb-2">{trip.name}</h2>
                        <p className="text-sm font-medium opacity-90 flex items-center">
                            <Calendar size={14} className="mr-1.5" />
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Totals Banner */}
            {expenses.length > 0 && (
                <div className="bg-white px-4 py-4 border-b border-gray-100 shadow-sm sticky top-[60px] z-20">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">{calculateTotals()}</p>
                </div>
            )}

            {/* Content */}
            <div className="px-4 py-6 space-y-6">

                {/* Expenses List */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                        <button
                            onClick={() => navigate(`/trip/${tripId}/add-expense`)}
                            className="text-blue-600 font-medium text-sm"
                        >
                            + Add
                        </button>
                    </div>

                    {expenses.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Tag className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm mb-4">No expenses recorded yet.</p>
                            <button
                                onClick={() => navigate(`/trip/${tripId}/add-expense`)}
                                className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                Add First Expense
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="divide-y divide-gray-50">
                                {expenses.map(expense => (
                                    <div key={expense.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${expense.category === 'Food' ? 'bg-orange-100 text-orange-600' :
                                            expense.category === 'Transport' ? 'bg-blue-100 text-blue-600' :
                                                expense.category === 'Hotel' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {getCategoryIcon(expense.category)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-900 font-medium truncate">{expense.description || expense.category}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {formatExpenseDate(expense.date)} • {expense.paidBy ? <span className="text-blue-500 font-medium">Paid by {memberNames[expense.paidBy] || expense.paidBy}</span> : expense.category}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-900 font-bold">
                                                {expense.amount.toFixed(2)} <span className="text-xs font-medium text-gray-500">{expense.currency}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-gray-500 text-sm">No notes pinned.</p>
                </div>
            </div>
            <TripModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateTrip}
                initialData={trip}
                title="Edit Trip"
                buttonText="Save Changes"
            />
            {trip && (
                <AddMemberModal
                    isOpen={isAddMemberModalOpen}
                    onClose={() => setIsAddMemberModalOpen(false)}
                    tripId={trip.id}
                    currentMembers={trip.members}
                    onMemberAdded={() => {
                        // The subscription will auto-update the list, so just close the modal maybe?
                        // Or keep it open. The component logic says "Let's keep it open", handled inside Modal?
                        // Actually Modal calls onMemberAdded.
                        // We can show a toast or just do nothing as the list updates live.
                    }}
                />
            )}
        </div>
    );
}
