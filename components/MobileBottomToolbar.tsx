import React, { useState } from 'react';
import { AppState, StyleConfig } from '../types';
import { TRANSLATIONS, FONTS } from '../constants';
import { Bold, Italic, Underline, CaseUpper, Plus, Minus, Palette } from 'lucide-react';

interface Props {
    state: AppState;
    updateStyle: (section: keyof AppState['styles'], config: StyleConfig) => void;
}

export const MobileBottomToolbar: React.FC<Props> = ({ state, updateStyle }) => {
    const t = TRANSLATIONS[state.language];
    const [activeStyleTab, setActiveStyleTab] = useState<'title' | 'header' | 'cell' | 'footer'>('title');

    const currentConfig = state.styles[activeStyleTab];
    const handleChangeStyle = (key: keyof StyleConfig, value: any) => {
        updateStyle(activeStyleTab, { ...currentConfig, [key]: value });
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/5 z-40 p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe flex flex-col gap-2">

            {/* Tabs for sections */}
            <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-lg overflow-x-auto scrollbar-none">
                {[
                    { id: 'title', label: t.mainTitle },
                    { id: 'header', label: t.tableHeaders },
                    { id: 'cell', label: t.cellContent },
                    { id: 'footer', label: t.footer }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveStyleTab(tab.id as any)}
                        className={`whitespace-nowrap flex-1 px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${activeStyleTab === tab.id ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Editing Tools Row */}
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-none scroll-smooth">
                {/* Font Sizes */}
                <div className="flex h-8 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden shrink-0">
                    <button onClick={() => handleChangeStyle('fontSize', Math.max(8, currentConfig.fontSize - 1))} className="w-8 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"><Minus size={14} /></button>
                    <input type="text" value={currentConfig.fontSize} readOnly className="w-8 text-center text-xs font-bold bg-white dark:bg-zinc-900 outline-none" />
                    <button onClick={() => handleChangeStyle('fontSize', Math.min(100, currentConfig.fontSize + 1))} className="w-8 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"><Plus size={14} /></button>
                </div>

                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0 mx-0.5"></div>

                {/* Formats */}
                <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shrink-0">
                    <button onClick={() => handleChangeStyle('fontWeight', currentConfig.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-1.5 rounded transition-colors ${currentConfig.fontWeight === 'bold' ? 'bg-primary text-white' : 'text-zinc-600 dark:text-zinc-300'}`}><Bold size={14} /></button>
                    <button onClick={() => handleChangeStyle('fontStyle', currentConfig.fontStyle === 'italic' ? 'normal' : 'italic')} className={`p-1.5 rounded transition-colors ${currentConfig.fontStyle === 'italic' ? 'bg-primary text-white' : 'text-zinc-600 dark:text-zinc-300'}`}><Italic size={14} /></button>
                    <button onClick={() => handleChangeStyle('textDecoration', currentConfig.textDecoration === 'underline' ? 'none' : 'underline')} className={`p-1.5 rounded transition-colors ${currentConfig.textDecoration === 'underline' ? 'bg-primary text-white' : 'text-zinc-600 dark:text-zinc-300'}`}><Underline size={14} /></button>
                </div>

                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0 mx-0.5"></div>

                {/* Colors */}
                <div className="flex gap-2 shrink-0">
                    <div className="relative group/color w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-600 shadow-sm shrink-0" style={{ backgroundColor: currentConfig.color }}>
                        <input type="color" value={currentConfig.color} onChange={(e) => handleChangeStyle('color', e.target.value)} className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer opacity-0" />
                    </div>
                    {activeStyleTab === 'header' && (
                        <div className="relative group/color w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-600 shadow-sm shrink-0" style={{ backgroundColor: currentConfig.backgroundColor || '#ffffff' }}>
                            <input type="color" value={currentConfig.backgroundColor || '#ffffff'} onChange={(e) => handleChangeStyle('backgroundColor', e.target.value)} className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer opacity-0" />
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0 mx-0.5"></div>

                {/* Font Family */}
                <div className="shrink-0 max-w-[120px]">
                    <select
                        value={currentConfig.fontFamily}
                        onChange={(e) => handleChangeStyle('fontFamily', e.target.value)}
                        className="w-full h-8 px-2 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 outline-none"
                    >
                        {FONTS.map(f => (
                            <option key={f} value={f} style={{ fontFamily: f }}>{f.split(',')[0].replace(/['"]/g, '')}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
