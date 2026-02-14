import React from 'react';

interface TripTabsProps {
    activeTab: 'expenses' | 'balances' | 'notes';
    onTabChange: (tab: 'expenses' | 'balances' | 'notes') => void;
}

const TripTabs: React.FC<TripTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="bg-white border-b border-gray-200 sticky top-[57px] z-20">
            <div className="flex p-2 gap-2">
                {(['expenses', 'balances', 'notes'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
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
    );
};

export default TripTabs;
