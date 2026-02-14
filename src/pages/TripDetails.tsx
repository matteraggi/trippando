import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, MoreHorizontal, ShoppingBag, Coffee, Car, Bed, Activity, Tag, Trash2, Edit2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { subscribeToTrip, updateTrip, deleteTrip } from '../services/tripService';
import { subscribeToExpenses } from '../services/expenseService';
import { getExchangeRates, convertCurrency } from '../services/currencyService';
import { getUsers } from '../services/userService';
import type { Trip } from '../types/Trip';
import type { Expense } from '../types/Expense';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { TRIP_ICONS } from '../constants/tripConstants';
import { CATEGORY_LABELS } from '../constants/expenseConstants';
import TripModal from '../components/TripModal';
import AddMemberModal from '../components/AddMemberModal';
import NoteModal from '../components/NoteModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { subscribeToNotes, addNote, updateNote, deleteNote } from '../services/noteService';
import type { Note } from '../types/Note';

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
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'notes'>('expenses');
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

    // Notes State
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    useEffect(() => {
        getExchangeRates('EUR').then(rates => setExchangeRates(rates));
    }, []);


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

    const handleSaveNote = async (noteData: { title: string; content: string }) => {
        if (!tripId || !currentUser) return;
        try {
            if (selectedNote) {
                await updateNote(tripId, selectedNote.id, noteData);
            } else {
                await addNote(tripId, { ...noteData, createdBy: currentUser.uid });
            }
            setIsNoteModalOpen(false);
            setSelectedNote(null);
        } catch (error) {
            console.error("Failed to save note", error);
            alert("Failed to save note");
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!tripId || !window.confirm("Sei sicuro di voler eliminare questa nota?")) return;
        try {
            await deleteNote(tripId, noteId);
        } catch (error) {
            console.error("Failed to delete note", error);
            alert("Failed to delete note");
        }
    };



    const handleDeleteTrip = async () => {
        if (!tripId || !window.confirm("Sei sicuro di voler eliminare questo viaggio? Tutte le spese verranno perse.")) return;
        try {
            await deleteTrip(tripId);
            navigate('/');
        } catch (error) {
            console.error("Failed to delete trip", error);
            alert("Failed to delete trip");
        }
    };


    const [memberNames, setMemberNames] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!tripId) return;

        const unsubscribeTrip = subscribeToTrip(tripId, (tripData) => {
            setTrip(tripData);
            setLoading(false);

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

        const unsubscribeNotes = subscribeToNotes(tripId, (notesList) => {
            setNotes(notesList);
        });

        return () => {
            unsubscribeTrip();
            unsubscribeExpenses();
            unsubscribeNotes();
        };
    }, [tripId]);

    const calculateTotals = () => {
        let totalEUR = 0;
        expenses.forEach(exp => {
            const amountInEUR = convertCurrency(exp.amount, exp.currency, 'EUR', exchangeRates);
            totalEUR += amountInEUR;
        });
        return `€${totalEUR.toFixed(2)}`;
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Viaggio non trovato</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-blue-500 hover:underline"
                >
                    Torna alla home
                </button>
            </div>
        );
    }

    if (currentUser && !trip.members.includes(currentUser.uid)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <h2 className="text-xl font-bold text-red-600 mb-2">Accesso Negato</h2>
                <p className="text-gray-600">Non sei un membro di questo viaggio.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-blue-500">Torna Indietro</button>
            </div>
        )
    }

    const calculateBalances = () => {
        if (!trip || !expenses.length) return [];

        const memberBalances: Record<string, number> = {};
        trip.members.forEach(uid => memberBalances[uid] = 0);

        let totalExpenses = 0;

        expenses.forEach(expense => {
            const amountInEUR = convertCurrency(expense.amount, expense.currency, 'EUR', exchangeRates);
            totalExpenses += amountInEUR;
            if (expense.paidBy) {
                memberBalances[expense.paidBy] = (memberBalances[expense.paidBy] || 0) + amountInEUR;
            }
        });

        const perPersonShare = totalExpenses / trip.members.length;

        const balances = trip.members.map(uid => ({
            uid,
            name: memberNames[uid] || 'Unknown',
            paid: memberBalances[uid] || 0,
            balance: (memberBalances[uid] || 0) - perPersonShare
        }));

        return balances.sort((a, b) => b.balance - a.balance);
    };

    const calculateSettlements = () => {
        // detailed deep copy to avoid mutating state indirectly if items are references
        const balances = calculateBalances().map(b => ({ ...b }));
        const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
        const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);

        const settlements = [];
        let i = 0;
        let j = 0;

        while (i < creditors.length && j < debtors.length) {
            const creditor = creditors[i];
            const debtor = debtors[j];

            const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
            if (amount < 0.01) break;

            settlements.push({
                from: debtor.name,
                to: creditor.name,
                amount: amount
            });

            debtor.balance += amount;
            creditor.balance -= amount;

            if (Math.abs(debtor.balance) < 0.01) j++;
            if (creditor.balance < 0.01) i++;
        }
        return settlements;
    };

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
                        Indietro
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
                                        Aggiungi Membro
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <div className="w-8 flex justify-center"><LucideIcons.Edit2 size={16} /></div>
                                        Modifica Viaggio
                                    </button>
                                    <button
                                        onClick={handleDeleteTrip}
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

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-[57px] z-20">
                <div className="flex p-2 gap-2">
                    {(['expenses', 'balances', 'notes'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${activeTab === tab
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab === 'expenses' ? 'Spese' : tab === 'balances' ? 'Bilancio' : 'Note'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Totals Banner (Only for Expenses) */}
            {activeTab === 'expenses' && expenses.length > 0 && (
                <div className="bg-white px-4 py-4 border-b border-gray-100 shadow-sm sticky top-[115px] z-20">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Totale Speso</p>
                    <p className="text-2xl font-bold text-gray-900">{calculateTotals()}</p>
                </div>
            )}

            {/* Content */}
            <div className="px-4 py-6 space-y-6">

                {/* Expenses List */}
                {activeTab === 'expenses' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Spese Recenti</h3>
                            <button
                                onClick={() => navigate(`/trip/${tripId}/add-expense`)}
                                className="text-blue-600 font-medium text-sm"
                            >
                                + Aggiungi
                            </button>
                        </div>

                        {expenses.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Tag className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm mb-4">Nessuna spesa registrata.</p>
                                <button
                                    onClick={() => navigate(`/trip/${tripId}/add-expense`)}
                                    className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Aggiungi Prima Spesa
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="divide-y divide-gray-50">
                                    {expenses.map(expense => (
                                        <div
                                            key={expense.id}
                                            onClick={() => navigate(`/trip/${tripId}/expense/${expense.id}`)}
                                            className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${expense.category === 'Food' ? 'bg-orange-100 text-orange-600' :
                                                expense.category === 'Transport' ? 'bg-blue-100 text-blue-600' :
                                                    expense.category === 'Hotel' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {getCategoryIcon(expense.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 font-medium truncate">{expense.description || CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] || expense.category}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {formatExpenseDate(expense.date)} • {expense.paidBy ? <span className="text-blue-500 font-medium">{memberNames[expense.paidBy] ? `${memberNames[expense.paidBy]}` : expense.paidBy}</span> : (CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] || expense.category)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-900 font-bold">
                                                    {expense.amount.toFixed(2)} <span className="text-xs font-medium text-gray-500">{expense.currency}</span>
                                                </p>
                                                {expense.currency !== 'EUR' && (
                                                    <p className="text-xs text-gray-400">
                                                        ≈ €{convertCurrency(expense.amount, expense.currency, 'EUR', exchangeRates).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                            <LucideIcons.ChevronRight size={16} className="text-gray-300 ml-2" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Balances Tab */}
                {activeTab === 'balances' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bilancio</h3>
                            <div className="space-y-4">
                                {calculateBalances().map(member => (
                                    <div key={member.uid} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-gray-600 font-semibold">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{member.name}</p>
                                                <p className="text-xs text-gray-500">Pagato: €{member.paid.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className={`text-right font-bold ${member.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {member.balance >= 0 ? '+' : ''}€{member.balance.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Settlement Plan (Improved UI) */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pareggio Debiti</h3>
                            <p className="text-gray-500 text-sm mb-3">Suggerimenti per saldare i debiti.</p>
                            <div className="space-y-3">
                                {calculateSettlements().length === 0 ? (
                                    <p className="text-gray-500 text-sm">Nessun pareggio necessario.</p>
                                ) : (
                                    calculateSettlements().map((settlement, idx) => (
                                        <div key={idx} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8"></div>

                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Deve dare</span>
                                                    <span className="font-bold text-gray-900 text-base">{settlement.from}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-lg font-bold text-blue-600">€{settlement.amount.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center text-gray-400 my-1">
                                                <div className="h-px bg-gray-200 flex-1"></div>
                                                <LucideIcons.ArrowDown size={14} className="mx-2" />
                                                <div className="h-px bg-gray-200 flex-1"></div>
                                            </div>

                                            <div className="flex flex-col mt-2">
                                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">A favore di</span>
                                                <span className="font-bold text-gray-900 text-base">{settlement.to}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <h3 className="text-lg font-semibold text-gray-900">Note di viaggio</h3>
                            <button
                                onClick={() => {
                                    setSelectedNote(null);
                                    setIsNoteModalOpen(true);
                                }}
                                className="text-blue-600 font-medium text-sm flex items-center"
                            >
                                <LucideIcons.Plus size={18} className="mr-1" />
                                Nuova Nota
                            </button>
                        </div>

                        {notes.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                                <LucideIcons.FileText size={48} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-500 text-sm mb-4">Nessuna nota presente.</p>
                                <button
                                    onClick={() => {
                                        setSelectedNote(null);
                                        setIsNoteModalOpen(true);
                                    }}
                                    className="px-5 py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Aggiungi la prima nota
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {notes.map(note => (
                                    <div key={note.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 text-lg">{note.title || 'Senza Titolo'}</h4>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedNote(note);
                                                        setIsNoteModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <LucideIcons.Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <LucideIcons.Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed line-clamp-3">{note.content}</p>
                                        <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex justify-between">
                                            <span>{formatDate(note.updatedAt)}</span>
                                            {memberNames[note.createdBy] && (
                                                <span>Di {memberNames[note.createdBy]}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSubmit={handleSaveNote}
                initialData={selectedNote}
                title={selectedNote ? "Modifica Nota" : "Nuova Nota"}
            />
            <TripModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateTrip}
                initialData={trip}
                title="Modifica Viaggio"
                buttonText="Salva Modifiche"
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
