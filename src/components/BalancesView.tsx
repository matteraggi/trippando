import React from 'react';
import { ArrowDown } from 'lucide-react';
import { convertCurrency } from '../services/currencyService';
import type { Trip } from '../types/Trip';
import type { Expense } from '../types/Expense';

interface BalancesViewProps {
    trip: Trip;
    expenses: Expense[];
    memberNames: Record<string, string>;
    exchangeRates: Record<string, number>;
}

const BalancesView: React.FC<BalancesViewProps> = ({
    trip,
    expenses,
    memberNames,
    exchangeRates
}) => {

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

    const calculateCategoryTotals = () => {
        const totals: Record<string, number> = {};
        let total = 0;

        expenses.forEach(expense => {
            const amountInEUR = convertCurrency(expense.amount, expense.currency, 'EUR', exchangeRates);
            totals[expense.category] = (totals[expense.category] || 0) + amountInEUR;
            total += amountInEUR;
        });

        const categories = Object.entries(totals)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: total > 0 ? (amount / total) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount);

        return { categories, total };
    };

    const CATEGORY_COLORS: Record<string, string> = {
        'Food': '#F97316',      // Orange-500
        'Transport': '#3B82F6', // Blue-500
        'Hotel': '#A855F7',     // Purple-500
        'Activity': '#10B981',  // Emerald-500
        'Shopping': '#EC4899',  // Pink-500
        'Other': '#6B7280'      // Gray-500
    };

    const { categories: categoryData, total: totalExpenses } = calculateCategoryTotals();

    // SVG Pie Chart Logic
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="space-y-6 pb-6">
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

            {/* Settlement Plan */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pareggio Debiti</h3>
                <p className="text-gray-500 text-sm mb-3">Suggerimenti per saldare i debiti.</p>
                <div className="space-y-3">
                    {calculateSettlements().length === 0 ? (
                        <p className="text-gray-500 text-sm">Nessun pareggio necessario.</p>
                    ) : (
                        calculateSettlements().map((settlement, idx) => (
                            <div key={idx} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/5 rounded-bl-full -mr-8 -mt-8"></div>

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Deve dare</span>
                                        <span className="font-bold text-gray-900 text-base">{settlement.from}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-lg font-bold text-primary-600">€{settlement.amount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center text-gray-400 my-1">
                                    <div className="h-px bg-gray-200 flex-1"></div>
                                    <ArrowDown size={14} className="mx-2" />
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

            {/* Spending by Category Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Spese per Categoria</h3>

                {categoryData.length > 0 ? (
                    <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48 mb-6">
                            <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full">
                                {categoryData.map((cat) => {
                                    // Calculate slice
                                    const startPercent = cumulativePercent;
                                    const slicePercent = cat.percentage / 100;
                                    cumulativePercent += slicePercent;
                                    const endPercent = cumulativePercent;

                                    // If it's a full circle (100%), draw a circle
                                    if (slicePercent === 1) {
                                        return (
                                            <circle key={cat.category} cx="0" cy="0" r="1" fill={CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Other']} />
                                        );
                                    }

                                    // Calculate coordinates
                                    const [startX, startY] = getCoordinatesForPercent(startPercent);
                                    const [endX, endY] = getCoordinatesForPercent(endPercent);

                                    // Determine if the arc should be greater than 180 degrees
                                    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

                                    // SVG Path command
                                    const pathData = [
                                        `M ${startX} ${startY}`, // Move to start
                                        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc to end
                                        `L 0 0`, // Line to center
                                    ].join(' ');

                                    return (
                                        <path
                                            key={cat.category}
                                            d={pathData}
                                            fill={CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Other']}
                                            stroke="white"
                                            strokeWidth="0.02" // separator lines
                                        />
                                    );
                                })}
                            </svg>
                            {/* Center Hole for Donut Chart effect (optional, currently full pie) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                    <span className="text-xs text-gray-400 font-medium">Totale</span>
                                    <span className="text-sm font-bold text-gray-900">€{totalExpenses.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="w-full space-y-3">
                            {categoryData.map(cat => (
                                <div key={cat.category} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className="w-3 h-3 rounded-full mr-3"
                                            style={{ backgroundColor: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['Other'] }}
                                        />
                                        <span className="text-gray-700 text-sm">{cat.category}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-900 font-medium text-sm mr-2">€{cat.amount.toFixed(2)}</span>
                                        <span className="text-gray-400 text-xs">({cat.percentage.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center text-sm py-8">Nessuna spesa da analizzare.</p>
                )}
            </div>
        </div>
    );
};

export default BalancesView;
