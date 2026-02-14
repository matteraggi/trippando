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

    return (
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
        </div>
    );
};

export default BalancesView;
