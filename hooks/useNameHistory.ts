import { useState, useEffect } from 'react';

const HISTORY_KEY = 'HUB_TEOCRATICO_NAME_HISTORY';

export function useNameHistory() {
    const [names, setNames] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const addName = (newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed) return;

        setNames(prev => {
            // Don't add if it already exists (case-insensitive)
            if (prev.some(name => name.toLowerCase() === trimmed.toLowerCase())) {
                return prev;
            }

            const newHistory = [trimmed, ...prev].slice(0, 50); // Keep last 50 names
            try {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            } catch (e) {
                console.error('Failed to save name history', e);
            }
            return newHistory;
        });
    };

    return { names, addName };
}
