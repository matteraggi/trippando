import axios from 'axios';

const API_URL = 'https://api.frankfurter.app';

interface RatesResponse {
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
}

// Cache rates to avoid unnecessary API calls
let cachedRates: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const getExchangeRates = async (base: string = 'EUR'): Promise<Record<string, number>> => {
    const now = Date.now();
    if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedRates;
    }

    try {
        const response = await axios.get<RatesResponse>(`${API_URL}/latest?from=${base}`);
        cachedRates = response.data.rates;
        // Ensure base currency is also in the rates (1:1)
        if (cachedRates) {
            cachedRates[base] = 1;
        }
        lastFetchTime = now;
        return cachedRates || {};
    } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        // Fallback: return empty rates, conversion will just return original amount or 0 if handled safely
        return {};
    }
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number => {
    if (fromCurrency === toCurrency) return amount;
    if (!rates || Object.keys(rates).length === 0) return amount;

    if (toCurrency === 'EUR') {
        const rate = rates[fromCurrency];
        if (!rate) return amount;
        return amount / rate;
    }

    const rateFrom = rates[fromCurrency];
    const rateTo = rates[toCurrency];

    if (!rateFrom || !rateTo) return amount;

    const amountInBase = amount / rateFrom;
    return amountInBase * rateTo;
};
