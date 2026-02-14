import React from 'react';
import { Coffee, Car, Bed, Activity, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { CATEGORY_LABELS } from '../constants/expenseConstants';
import { formatShortDate } from '../utils/dateUtils';
import { convertCurrency } from '../services/currencyService';
import type { Expense } from '../types/Expense';

interface ExpensesListProps {
    expenses: Expense[];
    tripId: string;
    memberNames: Record<string, string>;
    exchangeRates: Record<string, number>;
    onAddExpense: () => void;
    onExpenseClick: (expenseId: string) => void;
}

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

const ExpensesList: React.FC<ExpensesListProps> = ({
    expenses,
    memberNames,
    exchangeRates,
    onAddExpense,
    onExpenseClick
}) => {
    const calculateTotals = () => {
        let totalEUR = 0;
        expenses.forEach(exp => {
            const amountInEUR = convertCurrency(exp.amount, exp.currency, 'EUR', exchangeRates);
            totalEUR += amountInEUR;
        });
        return `€${totalEUR.toFixed(2)}`;
    };

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <div className="space-y-4">
            {/* Total Banner - Rounded Box Style */}
            {expenses.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Totale Speso</p>
                        <p className="text-2xl font-bold text-gray-900">{calculateTotals()}</p>
                    </div>
                    {/* Add button in the header if desired, or keep it separate */}
                </div>
            )}

            <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-lg font-semibold text-gray-900">Spese Recenti</h3>
                <button
                    onClick={onAddExpense}
                    className="text-blue-600 font-medium text-sm hover:underline"
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
                        onClick={onAddExpense}
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
                                onClick={() => onExpenseClick(expense.id)}
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
                                        {formatShortDate(expense.date)} • {expense.paidBy ? <span className="text-blue-500 font-medium">{memberNames[expense.paidBy] ? `${memberNames[expense.paidBy]}` : expense.paidBy}</span> : (CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] || expense.category)}
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
                                <ChevronRight size={16} className="text-gray-300 ml-2" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesList;
