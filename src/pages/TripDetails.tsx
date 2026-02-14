import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToTrip, updateTrip, deleteTrip } from '../services/tripService';
import { subscribeToExpenses } from '../services/expenseService';
import { getExchangeRates } from '../services/currencyService';
import { getUsers } from '../services/userService';
import type { Trip } from '../types/Trip';
import type { Expense } from '../types/Expense';
import { useAuth } from '../contexts/AuthContext';
import TripModal from '../components/TripModal';
import AddMemberModal from '../components/AddMemberModal';
import NoteModal from '../components/NoteModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { subscribeToNotes, addNote, updateNote, deleteNote } from '../services/noteService';
import type { Note } from '../types/Note';

// New Components
import TripHeader from '../components/TripHeader';
import TripTabs from '../components/TripTabs';
import ExpensesList from '../components/ExpensesList';
import BalancesView from '../components/BalancesView';
import NotesList from '../components/NotesList';

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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <TripHeader
                trip={trip}
                onBack={() => navigate(-1)}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                isMenuOpen={isMenuOpen}
                onCloseMenu={() => setIsMenuOpen(false)}
                onAddMember={() => {
                    setIsMenuOpen(false);
                    setIsAddMemberModalOpen(true);
                }}
                onEditTrip={() => {
                    setIsMenuOpen(false);
                    setIsEditModalOpen(true);
                }}
                onDeleteTrip={handleDeleteTrip}
            />

            <TripTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="px-4 py-6 space-y-6">
                {activeTab === 'expenses' && (
                    <ExpensesList
                        expenses={expenses}
                        tripId={tripId || ''}
                        memberNames={memberNames}
                        exchangeRates={exchangeRates}
                        onAddExpense={() => navigate(`/trip/${tripId}/add-expense`)}
                        onExpenseClick={(expenseId) => navigate(`/trip/${tripId}/expense/${expenseId}`)}
                    />
                )}

                {activeTab === 'balances' && (
                    <BalancesView
                        trip={trip}
                        expenses={expenses}
                        memberNames={memberNames}
                        exchangeRates={exchangeRates}
                    />
                )}

                {activeTab === 'notes' && (
                    <NotesList
                        notes={notes}
                        memberNames={memberNames}
                        onAddNote={() => {
                            setSelectedNote(null);
                            setIsNoteModalOpen(true);
                        }}
                        onEditNote={(note) => {
                            setSelectedNote(note);
                            setIsNoteModalOpen(true);
                        }}
                        onDeleteNote={handleDeleteNote}
                    />
                )}
            </div>

            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSubmit={handleSaveNote}
                initialData={selectedNote || undefined}
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
                    onMemberAdded={() => { }}
                />
            )}
        </div>
    );
}
