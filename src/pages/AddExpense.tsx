import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, Calendar, CreditCard, Tag, AlignLeft, User, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addExpense, getExpense, updateExpense, deleteExpense } from '../services/expenseService';
import { getTrip } from '../services/tripService';
import { getUsers, type UserProfile } from '../services/userService';
import { EXPENSE_CATEGORIES, EXPENSE_CURRENCIES, type ExpenseCategory, CATEGORY_LABELS } from '../constants/expenseConstants';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AddExpense() {
    const { tripId, expenseId } = useParams<{ tripId: string; expenseId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const isEditMode = !!expenseId;

    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('EUR');
    const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [members, setMembers] = useState<UserProfile[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [loadingExpense, setLoadingExpense] = useState(false);

    // Hydrate from navigation state if available (Instant Load)
    useEffect(() => {
        if (location.state && location.state.expense) {
            const expense = location.state.expense;
            setAmount(expense.amount.toString());
            setCurrency(expense.currency);
            setCategory(expense.category as ExpenseCategory);
            setDescription(expense.description);
            setPaidBy(expense.paidBy);
            // Handle date conversion
            const d = new Date(expense.date.seconds * 1000); // Firestore timestamp
            setDate(d.toISOString().split('T')[0]);
        }
    }, [location.state]);

    // Load trip members and expense data (if not passed via state)
    useEffect(() => {
        if (!tripId) return;

        const loadData = async () => {
            try {
                // 1. Load Trip Members
                const trip = await getTrip(tripId);
                if (trip && trip.members && trip.members.length > 0) {
                    const profiles = await getUsers(trip.members);
                    setMembers(profiles);

                    // Default paidBy logic (only if not editing or not yet set)
                    if (!isEditMode && !paidBy) {
                        if (currentUser && trip.members.includes(currentUser.uid)) {
                            setPaidBy(currentUser.uid);
                        } else if (profiles.length > 0) {
                            setPaidBy(profiles[0].uid);
                        }
                    }
                }

                // 2. Load Expense if in Edit Mode AND not already loaded from state
                if (isEditMode && expenseId && !location.state?.expense) {
                    setLoadingExpense(true);
                    const expense = await getExpense(expenseId);
                    if (expense) {
                        setAmount(expense.amount.toString());
                        setCurrency(expense.currency);
                        setCategory(expense.category as ExpenseCategory);
                        setDescription(expense.description);
                        setPaidBy(expense.paidBy);
                        // Handle date conversion safely
                        const d = expense.date instanceof Date ? expense.date : (expense.date as any).toDate();
                        setDate(d.toISOString().split('T')[0]);
                    } else {
                        alert("Spesa non trovata");
                        navigate(-1);
                    }
                }

            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoadingMembers(false);
                setLoadingExpense(false);
            }
        };
        loadData();
    }, [tripId, expenseId, currentUser, isEditMode, location.state]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !tripId || !amount) return;

        setIsSubmitting(true);
        try {
            const expenseData = {
                amount: parseFloat(amount),
                currency,
                category,
                description,
                paidBy,
                date: new Date(date),
                tripId
            };

            if (isEditMode && expenseId) {
                await updateExpense(expenseId, expenseData);
            } else {
                await addExpense(expenseData);
            }
            navigate(-1);
        } catch (error) {
            console.error("Failed to save expense", error);
            alert("Failed to save expense");
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!expenseId || !window.confirm("Sei sicuro di voler eliminare questa spesa?")) return;
        setIsSubmitting(true); // Reuse submitting state
        try {
            await deleteExpense(expenseId);
            navigate(-1);
        } catch (error) {
            console.error("Failed to delete expense", error);
            alert("Failed to delete expense");
            setIsSubmitting(false);
        }
    }

    if (loadingExpense) {
        return (
            <div className="min-h-full bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size={32} className="text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="px-4 py-4 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <X size={24} />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Modifica Spesa' : 'Nuova Spesa'}</h1>
                <button
                    onClick={handleSubmit}
                    disabled={!amount || isSubmitting}
                    className={`text-primary-600 font-semibold px-2 py-1 rounded hover:bg-primary-50 transition-colors ${(!amount || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''} flex items-center`}
                >
                    {isSubmitting ? <LoadingSpinner size={16} className="text-primary-600" /> : 'Salva'}
                </button>
            </header>

            <main className="flex-1 p-4 space-y-6">

                {/* Amount Input */}
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-medium text-gray-400">{currency}</span>
                        <input
                            type="number"
                            inputMode="decimal"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-6xl font-bold text-gray-900 bg-transparent outline-none w-full text-center max-w-[200px] placeholder-gray-200"
                            autoFocus={!isEditMode}
                        />
                    </div>
                </div>

                {/* Form Fields */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Paid By - Member Selector */}
                    <div className="flex items-center p-4 border-b border-gray-50">
                        <User className="text-gray-400 mr-3" size={20} />
                        <div className="flex-1">
                            <label className="text-xs text-gray-400 font-medium block mb-1">Pagato da</label>
                            {loadingMembers ? (
                                <div className="h-6 bg-gray-100 rounded animate-pulse w-32"></div>
                            ) : (
                                <div className="flex space-x-3 overflow-x-auto p-1 -m-1 no-scrollbar">
                                    {/* Me Option */}
                                    {currentUser && tripId && (
                                        <button
                                            type="button"
                                            onClick={() => setPaidBy(currentUser.uid)}
                                            className={`flex flex-shrink-0 items-center space-x-2 px-3 py-2 rounded-full border transition-all ${paidBy === currentUser.uid
                                                ? 'bg-primary-600 border-primary-600 text-white shadow-md transform scale-105'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${paidBy === currentUser.uid ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                Io
                                            </div>
                                            <span className="text-sm font-medium">Io</span>
                                        </button>
                                    )}

                                    {/* Other Members */}
                                    {members
                                        .filter(m => m.uid !== currentUser?.uid)
                                        .map(member => (
                                            <button
                                                key={member.uid}
                                                type="button"
                                                onClick={() => setPaidBy(member.uid)}
                                                className={`flex flex-shrink-0 items-center space-x-2 px-3 py-2 rounded-full border transition-all ${paidBy === member.uid
                                                    ? 'bg-primary-600 border-primary-600 text-white shadow-md transform scale-105'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${paidBy === member.uid ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {member.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium whitespace-nowrap">{member.displayName}</span>
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Currency Selector */}
                    <div className="flex items-center p-4 border-b border-gray-50">
                        <CreditCard className="text-gray-400 mr-3" size={20} />
                        <div className="flex-1 overflow-x-auto flex space-x-2 no-scrollbar">
                            {EXPENSE_CURRENCIES.map(curr => (
                                <button
                                    key={curr}
                                    onClick={() => setCurrency(curr)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${currency === curr ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Selector */}
                    <div className="p-4 border-b border-gray-50">
                        <div className="flex items-center mb-3">
                            <Tag className="text-gray-400 mr-3" size={20} />
                            <span className="text-gray-900 font-medium">Categoria</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {EXPENSE_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors border ${category === cat ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600'}`}
                                >
                                    {CATEGORY_LABELS[cat]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex items-center p-4 border-b border-gray-50">
                        <AlignLeft className="text-gray-400 mr-3" size={20} />
                        <input
                            type="text"
                            placeholder="Descrizione (opzionale)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex-1 outline-none text-gray-900 placeholder-gray-400"
                        />
                    </div>

                    {/* Date */}
                    <div className="flex items-center p-4">
                        <Calendar className="text-gray-400 mr-3" size={20} />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="flex-1 outline-none text-gray-900 bg-transparent"
                        />
                    </div>

                </div>

                {/* Delete Button (Only in Edit Mode) */}
                {isEditMode && (
                    <button
                        onClick={handleDelete}
                        className="w-full py-3 text-red-600 bg-white rounded-xl shadow-sm border border-gray-100 font-medium flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={20} className="mr-2" />
                        Elimina Spesa
                    </button>
                )}

            </main>
        </div>
    );
}
