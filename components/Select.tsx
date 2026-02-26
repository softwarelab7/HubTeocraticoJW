import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    className = '',
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string | number) => {
        onChange(String(optionValue));
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between rounded-lg border bg-white dark:bg-black/20 px-3 py-2.5 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${isOpen
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                    }`}
            >
                <span className={`block truncate ${!selectedOption ? 'text-zinc-400' : 'text-zinc-700 dark:text-zinc-200'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {(isOpen && !disabled) && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl bg-white dark:bg-zinc-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none text-sm animate-in fade-in zoom-in-95 duration-100 border border-zinc-100 dark:border-white/10">
                    <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`relative flex w-full select-none items-center justify-between py-2 px-3 cursor-pointer transition-colors rounded-lg mb-0.5 last:mb-0 ${option.value === value
                                    ? 'bg-primary/10 text-primary font-bold'
                                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                                    }`}
                            >
                                <span className="block truncate text-left">{option.label}</span>
                                {option.value === value && (
                                    <span className="flex items-center text-primary">
                                        <Check size={16} aria-hidden="true" />
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
