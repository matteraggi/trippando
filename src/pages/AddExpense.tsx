import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Check, Calendar, CreditCard, Tag, AlignLeft, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addExpense, subscribeToExpenses } from '../services/expenseService';
import { EXPENSE_CATEGORIES, EXPENSE_CURRENCIES, type ExpenseCategory } from '../constants/expenseConstants';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AddExpense() {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('EUR');
    const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [payerSuggestions, setPayerSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Load suggestions and set default payer
    useEffect(() => {
        if (!tripId) return;

        // Default to current user's name or email
        if (currentUser) {
            setPaidBy(currentUser.displayName || currentUser.email?.split('@')[0] || 'Me');
        }

        const unsubscribe = subscribeToExpenses(tripId, (expenses) => {
            const uniquePayers = Array.from(new Set(expenses.map(e => e.paidBy).filter(Boolean)));
            setPayerSuggestions(uniquePayers);
        });

        return () => unsubscribe();
    }, [tripId, currentUser]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !tripId || !amount) return;

        setIsSubmitting(true);
        try {
            await addExpense({
                amount: parseFloat(amount),
                currency,
                category,
                description,
                paidBy,
                date: new Date(date),
                tripId
            });
            navigate(-1); // Go back
        } catch (error) {
            console.error("Failed to add expense", error);
            alert("Failed to add expense");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="px-4 py-4 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <X size={24} />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">New Expense</h1>
                <button
                    onClick={handleSubmit}
                    disabled={!amount || isSubmitting}
                    className={`text-blue-600 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors ${(!amount || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''} flex items-center`}
                >
                    {isSubmitting ? <LoadingSpinner size={16} color="#2563EB" /> : 'Save'}
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
                            autoFocus
                        />
                    </div>
                </div>

                {/* Form Fields */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Paid By */}
                    <div className="flex items-center p-4 border-b border-gray-50 relative z-20">
                        <User className="text-gray-400 mr-3" size={20} />
                        <div className="flex-1 relative">
                            <label className="text-xs text-gray-400 font-medium block mb-1">Paid by</label>
                            <input
                                type="text"
                                value={paidBy}
                                onChange={(e) => {
                                    setPaidBy(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                                className="w-full outline-none text-gray-900 placeholder-gray-400 font-medium"
                                placeholder="Who paid?"
                            />

                            {/* Custom Dropdown */}
                            {showSuggestions && (payerSuggestions.length > 0 || paidBy) && (
                                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                                    <div className="max-h-48 overflow-y-auto">
                                        {/* Suggest 'Me' if not already selected */}
                                        {currentUser && 'Me'.toLowerCase().includes(paidBy.toLowerCase()) && (
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 text-sm text-gray-700"
                                                onClick={() => {
                                                    setPaidBy('Me');
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">M</div>
                                                <span>Me</span>
                                            </button>
                                        )}
                                        {payerSuggestions
                                            .filter(p => p !== 'Me' && p.toLowerCase().includes(paidBy.toLowerCase()))
                                            .map(payer => (
                                                <button
                                                    key={payer}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 text-sm text-gray-700"
                                                    onClick={() => {
                                                        setPaidBy(payer);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                        {payer.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{payer}</span>
                                                </button>
                                            ))}
                                        {paidBy && !payerSuggestions.includes(paidBy) && paidBy !== 'Me' && (
                                            <div className="px-4 py-2 text-xs text-gray-400 italic border-t border-gray-50">
                                                Use "{paidBy}"
                                            </div>
                                        )}
                                    </div>
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
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${currency === curr ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
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
                            <span className="text-gray-900 font-medium">Category</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {EXPENSE_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors border ${category === cat ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex items-center p-4 border-b border-gray-50">
                        <AlignLeft className="text-gray-400 mr-3" size={20} />
                        <input
                            type="text"
                            placeholder="Description (optional)"
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
            </main>
        </div>
    );
}
