import React, { useState, useRef, useEffect } from 'react';
import { AppState, TemplateType, StyleConfig } from '../types';
import { TRANSLATIONS, FONTS, THEME_COLORS } from '../constants';
import { Settings, Image as ImageIcon, Download, Type, Palette, Upload, Trash2, Check, ChevronDown, Bold, Italic, Underline, CaseUpper, Plus, Minus, LayoutTemplate } from 'lucide-react';

interface Props {
    state: AppState;
    updateState: (updates: Partial<AppState>) => void;
    updateStyle: (section: keyof AppState['styles'], config: StyleConfig) => void;
    onDownload: () => void;
    isGeneratingPDF: boolean;
}

export const TopToolbar: React.FC<Props> = ({ state, updateState, updateStyle, onDownload, isGeneratingPDF }) => {
    const t = TRANSLATIONS[state.language];
    const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
    const [activeStyleTab, setActiveStyleTab] = useState<'title' | 'header' | 'cell' | 'footer'>('title');
    const styleMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (styleMenuRef.current && !styleMenuRef.current.contains(event.target as Node)) {
                setIsStyleMenuOpen(false);
            }
        };
        if (isStyleMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isStyleMenuOpen]);

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                updateState({
                    banner: { ...state.banner, image: event.target?.result as string, showBanner: true, zoom: 1, x: 0, y: 0 }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const currentConfig = state.styles[activeStyleTab];
    const handleChangeStyle = (key: keyof StyleConfig, value: any) => {
        updateStyle(activeStyleTab, { ...currentConfig, [key]: value });
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/5 py-1.5 md:py-2 px-2 md:px-8 flex items-center sticky top-0 z-40 print:hidden shadow-sm w-full max-w-[100vw] overflow-hidden">
            <div className="flex items-center gap-2 md:gap-4 flex-nowrap justify-start pr-4 mask-edge-fade w-full overflow-x-auto overflow-y-hidden scrollbar-none scroll-smooth">

                {/* Template Toggle */}
                <div className="flex items-center shrink-0">
                    <span className="hidden md:inline text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-2">{t.selectTemplate}</span>

                    <div className="w-32 md:w-40">
                        <select
                            value={state.template}
                            onChange={(e) => updateState({ template: e.target.value as TemplateType })}
                            className="w-full flex items-center justify-between rounded-lg border bg-white dark:bg-black/20 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-all outline-none border-zinc-200 dark:border-white/10"
                        >
                            <option value="acomodadores">{t.templateUshers}</option>
                            <option value="aseo">{t.templateCleaning}</option>
                        </select>
                    </div>
                </div>

                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5 md:mx-1 shrink-0"></div>

                {/* Banner Toggle (Icon Only on Mobile / Compact) */}
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <span className="hidden md:inline text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{t.banner}</span>

                    <button
                        onClick={() => updateState({ banner: { ...state.banner, showBanner: !state.banner.showBanner } })}
                        className={`p-2 md:hidden rounded-lg border transition-all ${state.banner.showBanner !== false ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'}`}
                        title="Alternar Banner"
                    >
                        <ImageIcon size={16} />
                    </button>

                    <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-0.5 border border-zinc-200 dark:border-transparent">
                        <button
                            onClick={() => updateState({ banner: { ...state.banner, showBanner: true } })}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${state.banner.showBanner !== false ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Sí
                        </button>
                        <button
                            onClick={() => updateState({ banner: { ...state.banner, showBanner: false } })}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${state.banner.showBanner === false ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            No
                        </button>
                    </div>

                    {state.banner.showBanner !== false && (
                        <div className="relative group ml-1">
                            <input type="file" accept="image/*" className="hidden" id="toolbar-banner-upload" onChange={handleBannerUpload} />
                            <label htmlFor="toolbar-banner-upload" className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:px-3 md:py-1.5 rounded-lg border cursor-pointer transition-all ${state.banner.image ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'}`}>
                                {state.banner.image ? <Check size={16} /> : <Upload size={16} />}
                                <span className="hidden md:inline text-xs font-bold uppercase">{state.banner.image ? 'OK' : 'Subir'}</span>
                            </label>
                            {state.banner.image && (
                                <button
                                    onClick={(e) => { e.preventDefault(); updateState({ banner: { ...state.banner, image: null } }); }}
                                    className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 opacity-100"
                                    title="Eliminar"
                                >
                                    <Trash2 size={10} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5 md:mx-1 shrink-0"></div>

                <div className="hidden md:block w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5 md:mx-1 shrink-0"></div>

                {/* --- Desktop Only: Full Styles Dropdown --- */}
                <div className="hidden md:block relative shrink-0" ref={styleMenuRef}>
                    <button
                        onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isStyleMenuOpen ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'}`}
                        title={t.styles}
                    >
                        <Palette size={16} />
                        <span className="text-xs font-bold uppercase">{t.styles}</span>
                        <ChevronDown size={14} className={`transition-transform ${isStyleMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isStyleMenuOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 mt-2 w-72 md:w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-3 z-50">
                            {/* Style Controls (Same as before) */}
                            <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-lg mb-4">
                                {[
                                    { id: 'title', label: t.mainTitle },
                                    { id: 'header', label: t.tableHeaders },
                                    { id: 'cell', label: t.cellContent },
                                    { id: 'footer', label: t.footer }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveStyleTab(tab.id as any)}
                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${activeStyleTab === tab.id ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex-1 space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Fuente</label>
                                        <select
                                            value={currentConfig.fontFamily}
                                            onChange={(e) => handleChangeStyle('fontFamily', e.target.value)}
                                            className="w-full h-8 px-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 outline-none"
                                        >
                                            {FONTS.map(f => (
                                                <option key={f} value={f} style={{ fontFamily: f }}>{f.split(',')[0].replace(/['"]/g, '')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24 space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Tamaño</label>
                                        <div className="flex h-8 border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden">
                                            <button onClick={() => handleChangeStyle('fontSize', Math.max(8, currentConfig.fontSize - 1))} className="w-7 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"><Minus size={12} /></button>
                                            <input type="text" value={currentConfig.fontSize} readOnly className="flex-1 w-full text-center text-xs font-bold bg-white dark:bg-zinc-900 outline-none" />
                                            <button onClick={() => handleChangeStyle('fontSize', Math.min(100, currentConfig.fontSize + 1))} className="w-7 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Colores</label>
                                        <div className="flex gap-2">
                                            <div className="relative group/color" title="Color de Texto">
                                                <div className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-600 shadow-sm" style={{ backgroundColor: currentConfig.color }}>
                                                    <input type="color" value={currentConfig.color} onChange={(e) => handleChangeStyle('color', e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                                                </div>
                                            </div>
                                            {activeStyleTab === 'header' && (
                                                <div className="relative group/color" title="Color de Fondo">
                                                    <div className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-600 shadow-sm" style={{ backgroundColor: currentConfig.backgroundColor || '#ffffff' }}>
                                                        <input type="color" value={currentConfig.backgroundColor || '#ffffff'} onChange={(e) => handleChangeStyle('backgroundColor', e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Formato</label>
                                        <div className="flex gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                            <button onClick={() => handleChangeStyle('fontWeight', currentConfig.fontWeight === 'bold' ? 'normal' : 'bold')} className={`flex-1 flex items-center justify-center py-1 rounded transition-colors ${currentConfig.fontWeight === 'bold' ? 'bg-primary text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}><Bold size={14} /></button>
                                            <button onClick={() => handleChangeStyle('fontStyle', currentConfig.fontStyle === 'italic' ? 'normal' : 'italic')} className={`flex-1 flex items-center justify-center py-1 rounded transition-colors ${currentConfig.fontStyle === 'italic' ? 'bg-primary text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}><Italic size={14} /></button>
                                            <button onClick={() => handleChangeStyle('textDecoration', currentConfig.textDecoration === 'underline' ? 'none' : 'underline')} className={`flex-1 flex items-center justify-center py-1 rounded transition-colors ${currentConfig.textDecoration === 'underline' ? 'bg-primary text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}><Underline size={14} /></button>
                                            <button onClick={() => handleChangeStyle('textTransform', currentConfig.textTransform === 'uppercase' ? 'none' : 'uppercase')} className={`flex-1 flex items-center justify-center py-1 rounded transition-colors ${currentConfig.textTransform === 'uppercase' ? 'bg-primary text-white' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}><CaseUpper size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Export Button (Sticky, never scrolls) */}
                <div className="shrink-0 md:ml-auto pl-1 md:pl-2">
                    <button
                        onClick={onDownload}
                        disabled={isGeneratingPDF}
                        className="flex items-center justify-center gap-1 md:gap-2 p-2 md:px-4 md:py-2 bg-primary text-white rounded-lg shadow-md hover:scale-105 transition-all text-sm font-bold disabled:opacity-50"
                        title="Exportar PDF"
                    >
                        {isGeneratingPDF ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download size={16} />
                        )}
                        <span className="hidden md:inline">Exportar PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
