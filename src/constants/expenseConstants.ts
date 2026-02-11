export const EXPENSE_CATEGORIES = [
    'Food', 'Transport', 'Hotel', 'Activity', 'Shopping', 'Other'
] as const;

export const EXPENSE_CURRENCIES = ['EUR', 'USD', 'GBP', 'THB'] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type ExpenseCurrency = typeof EXPENSE_CURRENCIES[number];
