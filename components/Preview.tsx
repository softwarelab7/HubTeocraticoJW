import React, { useEffect, useState, useRef } from 'react';
import { AppState, MonthData, StyleConfig } from '../types';
import { TRANSLATIONS, getMonthName } from '../constants';
import { ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Image as ImageIcon, CalendarDays } from 'lucide-react';
import { useNameHistory } from '../hooks/useNameHistory';

interface Props {
    state: AppState;
    updateState: (updates: Partial<AppState>) => void;
    isGenerating: boolean;
}

const getStyleString = (config: StyleConfig) => {
    return {
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`,
        color: config.color,
        backgroundColor: config.backgroundColor,
        fontWeight: config.fontWeight,
        fontStyle: config.fontStyle,
        textDecoration: config.textDecoration,
        textTransform: config.textTransform as any,
    };
};

export const Preview: React.FC<Props> = ({ state, updateState, isGenerating }) => {
    const t = TRANSLATIONS[state.language];
    const { names: nameHistory, addName } = useNameHistory();
    const bannerState = state.banner;

    const setBannerState = (b: AppState['banner']) => {
        updateState({ banner: b });
    };

    // Logic to calculate dates for the table rows
    const getDatesForWeeks = (month: MonthData) => {
        if (month.selectedDays.length === 0) return [];

        const dates: string[] = [];
        const year = month.year;
        const monthIndex = month.monthIndex;

        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        let currentWeekDates: number[] = [];
        let currentWeekNumber = -1;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthIndex, day);
            const dayOfWeek = date.getDay(); // 0 = Sun

            if (month.selectedDays.includes(dayOfWeek)) {
                const dist = (dayOfWeek + 6) % 7; // Mon=0, Sun=6
                const monday = new Date(date);
                monday.setDate(date.getDate() - dist);
                const weekNum = monday.getTime();

                if (weekNum !== currentWeekNumber) {
                    if (currentWeekDates.length > 0) {
                        dates.push(currentWeekDates.join(' y '));
                    }
                    currentWeekDates = [];
                    currentWeekNumber = weekNum;
                }
                currentWeekDates.push(day);
            }
        }
        if (currentWeekDates.length > 0) {
            dates.push(currentWeekDates.join(' y '));
        }
        return dates;
    };

    const moveBanner = (dx: number, dy: number) => {
        setBannerState({
            ...bannerState,
            x: bannerState.x + dx,
            y: bannerState.y + dy
        });
    };

    const [scale, setScale] = useState(1);
    const [adjustedTitleFontSize, setAdjustedTitleFontSize] = useState<number>(state.styles.title.fontSize);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const handleResize = () => {
            const padding = window.innerWidth < 1050 ? 32 : 64;
            const availableWidth = window.innerWidth - padding;
            const newScale = Math.min(1, availableWidth / 816);
            setScale(newScale);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!titleRef.current) return;

        const adjustTitleSize = () => {
            const titleElement = titleRef.current;
            if (!titleElement) return;

            let currentSize = state.styles.title.fontSize;
            setAdjustedTitleFontSize(currentSize);
            titleElement.style.fontSize = `${currentSize}px`;

            const maxWidth = 816 - (1.5 * 16 * 2);
            let iterations = 0;
            while (titleElement.scrollWidth > maxWidth && currentSize > 12 && iterations < 50) {
                currentSize -= 1;
                titleElement.style.fontSize = `${currentSize}px`;
                setAdjustedTitleFontSize(currentSize);
                iterations++;
            }
        };

        const timeoutId = setTimeout(adjustTitleSize, 50);
        return () => clearTimeout(timeoutId);
    }, [state.styles.title.fontSize, state.template, state.language]);

    return (
        <div className="flex justify-center w-full min-h-full pb-[10px]" style={{ height: 1056 * scale, marginBottom: 20 }}>
            <div
                id="pdf-content"
                className="w-[816px] min-w-[816px] shrink-0 min-h-[1056px] bg-white shadow-xl text-black flex flex-col transition-all origin-top"
                style={{ transform: `scale(${scale})` }}
            >
                <div className="flex flex-col h-full flex-grow relative pb-8">
                    <div
                        className="w-full px-6 text-center z-20 pointer-events-none flex justify-center"
                        style={{ position: 'absolute', top: '1rem', left: 0 }}
                    >
                        {isGenerating ? (
                            <h2
                                ref={titleRef}
                                style={{
                                    ...getStyleString(state.styles.title),
                                    fontSize: `${adjustedTitleFontSize}px`,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }}
                                className="pointer-events-auto inline-block"
                            >
                                {state.styles.documentTitle || (state.template === 'acomodadores' ? t.previewTitleUshers : t.previewTitleCleaning)}
                            </h2>
                        ) : (
                            <input
                                ref={titleRef as any}
                                type="text"
                                style={{
                                    ...getStyleString(state.styles.title),
                                    fontSize: `${adjustedTitleFontSize}px`,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    textAlign: 'center',
                                    width: '100%',
                                }}
                                className="pointer-events-auto inline-block hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:bg-black/5 dark:focus:bg-white/5 rounded px-2"
                                value={state.styles.documentTitle ?? (state.template === 'acomodadores' ? t.previewTitleUshers : t.previewTitleCleaning)}
                                onChange={(e) => updateState({ styles: { ...state.styles, documentTitle: e.target.value } })}
                            />
                        )}
                    </div>

                    {bannerState.showBanner !== false && (
                        <div
                            className="bg-zinc-100 rounded-lg overflow-hidden group border border-zinc-200 z-10 w-auto"
                            style={{ position: 'absolute', top: '5.5rem', left: '1.5rem', right: '1.5rem', height: '12rem' }}
                        >
                            {bannerState.image ? (
                                <div className="w-full h-full relative overflow-hidden">
                                    <img
                                        src={bannerState.image}
                                        alt="Banner"
                                        className="absolute"
                                        style={{
                                            transform: `translate(-50%, -50%) scale(${bannerState.zoom}) translate(${bannerState.x}px, ${bannerState.y}px)`,
                                            left: '50%',
                                            top: '50%',
                                            transformOrigin: 'center center'
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                                    <ImageIcon size={48} className="mb-2 opacity-50" />
                                    <p className="text-sm font-medium">{t.previewPlaceholder}</p>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => moveBanner(0, -10)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><ArrowUp size={16} /></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => moveBanner(-10, 0)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><ArrowLeft size={16} /></button>
                                    <button onClick={() => moveBanner(10, 0)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><ArrowRight size={16} /></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => moveBanner(0, 10)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><ArrowDown size={16} /></button>
                                </div>
                                <div className="flex items-center gap-2 mt-2 w-48 px-4">
                                    <ZoomOut size={16} className="text-white" />
                                    <input
                                        type="range" min="0.5" max="3" step="0.1"
                                        value={bannerState.zoom}
                                        onChange={(e) => setBannerState({ ...bannerState, zoom: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-white/50 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <ZoomIn size={16} className="text-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`flex-grow px-6 space-y-4 ${bannerState.showBanner !== false ? 'mt-[295px]' : 'mt-[100px]'}`}>
                        {state.months.map(month => {
                            const dates = getDatesForWeeks(month);
                            return (
                                <div key={month.id} className="shadow-sm" style={{ border: '1px solid #cbd5e1', borderRadius: '0.5rem', boxSizing: 'border-box', backgroundColor: '#ffffff', overflow: 'hidden', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                    <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
                                        <thead style={{ backgroundColor: '#f8fafc', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                            <tr>
                                                <th className="p-2 text-center w-[15%] text-xs font-semibold tracking-wider text-slate-700" style={{ ...getStyleString(state.styles.header), borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                    {getMonthName(month.monthIndex, state.language).toUpperCase()}
                                                </th>
                                                {state.template === 'acomodadores' ? (
                                                    <>
                                                        <th className="p-2 text-center text-xs font-semibold tracking-wider text-slate-700" style={{ ...getStyleString(state.styles.header), borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{t.door}</th>
                                                        <th className="p-2 text-center text-xs font-semibold tracking-wider text-slate-700" style={{ ...getStyleString(state.styles.header), borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{t.auditorium}</th>
                                                        <th className="p-2 text-center text-xs font-semibold tracking-wider text-slate-700" style={{ ...getStyleString(state.styles.header), borderBottom: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{t.mic1}</th>
                                                        <th className="p-2 text-center text-xs font-semibold tracking-wider text-slate-700" style={{ ...getStyleString(state.styles.header), borderBottom: '1px solid #cbd5e1', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{t.mic2}</th>
                                                    </>
                                                ) : (
                                                    <th className="p-2 text-center text-xs font-semibold tracking-wider text-slate-700" style={{ ...getStyleString(state.styles.header), borderBottom: '1px solid #cbd5e1', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{t.assignedGroup}</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody style={getStyleString(state.styles.cell)}>
                                            {dates.length > 0 ? dates.map((dateStr, idx) => {
                                                const weekData = month.weeks[idx] || { id: '', door: '', auditorium: '', mic1: '', mic2: '', group: '' };
                                                const isLastRow = idx === dates.length - 1;
                                                const rowBorder = isLastRow ? 'none' : '1px solid #cbd5e1';

                                                return (
                                                    <tr key={idx} className={`transition-colors hover:bg-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                        <td className="p-2 text-center font-semibold text-slate-800" style={{ borderBottom: rowBorder, borderRight: '1px solid #cbd5e1', boxSizing: 'border-box' }}>{dateStr}</td>
                                                        {state.template === 'acomodadores' ? (
                                                            <>
                                                                <td className="p-0 text-center" style={{ borderBottom: rowBorder, borderRight: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                                                                    <input
                                                                        type="text"
                                                                        list="name-suggestions"
                                                                        value={weekData.door}
                                                                        onBlur={(e) => addName(e.target.value)}
                                                                        onChange={(e) => {
                                                                            const newMonths = [...state.months];
                                                                            const mIdx = newMonths.findIndex(m => m.id === month.id);
                                                                            if (mIdx >= 0) {
                                                                                const newWeeks = [...newMonths[mIdx].weeks];
                                                                                const wIdx = newWeeks.findIndex(w => w.id === weekData.id);
                                                                                if (wIdx >= 0) {
                                                                                    newWeeks[wIdx] = { ...newWeeks[wIdx], door: e.target.value };
                                                                                    newMonths[mIdx] = { ...newMonths[mIdx], weeks: newWeeks };
                                                                                    updateState({ months: newMonths });
                                                                                }
                                                                            }
                                                                        }}
                                                                        className={`w-full h-full text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-text ${isGenerating ? 'pointer-events-none' : ''}`}
                                                                        style={{ padding: '0.5rem', color: 'inherit', font: 'inherit' }}
                                                                    />
                                                                </td>
                                                                <td className="p-0 text-center" style={{ borderBottom: rowBorder, borderRight: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                                                                    <input
                                                                        type="text"
                                                                        list="name-suggestions"
                                                                        value={weekData.auditorium}
                                                                        onBlur={(e) => addName(e.target.value)}
                                                                        onChange={(e) => {
                                                                            const newMonths = [...state.months];
                                                                            const mIdx = newMonths.findIndex(m => m.id === month.id);
                                                                            if (mIdx >= 0) {
                                                                                const newWeeks = [...newMonths[mIdx].weeks];
                                                                                const wIdx = newWeeks.findIndex(w => w.id === weekData.id);
                                                                                if (wIdx >= 0) {
                                                                                    newWeeks[wIdx] = { ...newWeeks[wIdx], auditorium: e.target.value };
                                                                                    newMonths[mIdx] = { ...newMonths[mIdx], weeks: newWeeks };
                                                                                    updateState({ months: newMonths });
                                                                                }
                                                                            }
                                                                        }}
                                                                        className={`w-full h-full text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-text ${isGenerating ? 'pointer-events-none' : ''}`}
                                                                        style={{ padding: '0.5rem', color: 'inherit', font: 'inherit' }}
                                                                    />
                                                                </td>
                                                                <td className="p-0 text-center" style={{ borderBottom: rowBorder, borderRight: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                                                                    <input
                                                                        type="text"
                                                                        list="name-suggestions"
                                                                        value={weekData.mic1}
                                                                        onBlur={(e) => addName(e.target.value)}
                                                                        onChange={(e) => {
                                                                            const newMonths = [...state.months];
                                                                            const mIdx = newMonths.findIndex(m => m.id === month.id);
                                                                            if (mIdx >= 0) {
                                                                                const newWeeks = [...newMonths[mIdx].weeks];
                                                                                const wIdx = newWeeks.findIndex(w => w.id === weekData.id);
                                                                                if (wIdx >= 0) {
                                                                                    newWeeks[wIdx] = { ...newWeeks[wIdx], mic1: e.target.value };
                                                                                    newMonths[mIdx] = { ...newMonths[mIdx], weeks: newWeeks };
                                                                                    updateState({ months: newMonths });
                                                                                }
                                                                            }
                                                                        }}
                                                                        className={`w-full h-full text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-text ${isGenerating ? 'pointer-events-none' : ''}`}
                                                                        style={{ padding: '0.5rem', color: 'inherit', font: 'inherit' }}
                                                                    />
                                                                </td>
                                                                <td className="p-0 text-center" style={{ borderBottom: rowBorder, boxSizing: 'border-box' }}>
                                                                    <input
                                                                        type="text"
                                                                        list="name-suggestions"
                                                                        value={weekData.mic2}
                                                                        onBlur={(e) => addName(e.target.value)}
                                                                        onChange={(e) => {
                                                                            const newMonths = [...state.months];
                                                                            const mIdx = newMonths.findIndex(m => m.id === month.id);
                                                                            if (mIdx >= 0) {
                                                                                const newWeeks = [...newMonths[mIdx].weeks];
                                                                                const wIdx = newWeeks.findIndex(w => w.id === weekData.id);
                                                                                if (wIdx >= 0) {
                                                                                    newWeeks[wIdx] = { ...newWeeks[wIdx], mic2: e.target.value };
                                                                                    newMonths[mIdx] = { ...newMonths[mIdx], weeks: newWeeks };
                                                                                    updateState({ months: newMonths });
                                                                                }
                                                                            }
                                                                        }}
                                                                        className={`w-full h-full text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-text ${isGenerating ? 'pointer-events-none' : ''}`}
                                                                        style={{ padding: '0.5rem', color: 'inherit', font: 'inherit' }}
                                                                    />
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <td className="p-0 text-center" style={{ borderBottom: rowBorder, boxSizing: 'border-box' }}>
                                                                <input
                                                                    type="text"
                                                                    list="name-suggestions"
                                                                    value={weekData.group}
                                                                    onBlur={(e) => addName(e.target.value)}
                                                                    onChange={(e) => {
                                                                        const newMonths = [...state.months];
                                                                        const mIdx = newMonths.findIndex(m => m.id === month.id);
                                                                        if (mIdx >= 0) {
                                                                            const newWeeks = [...newMonths[mIdx].weeks];
                                                                            const wIdx = newWeeks.findIndex(w => w.id === weekData.id);
                                                                            if (wIdx >= 0) {
                                                                                newWeeks[wIdx] = { ...newWeeks[wIdx], group: e.target.value };
                                                                                newMonths[mIdx] = { ...newMonths[mIdx], weeks: newWeeks };
                                                                                updateState({ months: newMonths });
                                                                            }
                                                                        }
                                                                    }}
                                                                    className={`w-full h-full text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-text ${isGenerating ? 'pointer-events-none' : ''}`}
                                                                    style={{ padding: '0.5rem', color: 'inherit', font: 'inherit' }}
                                                                    placeholder="Grupo..."
                                                                />
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan={5} className="p-6 text-center" style={{ borderTop: '1px solid #cbd5e1', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                                                                <CalendarDays size={18} className="text-slate-500" />
                                                            </div>
                                                            <p className="font-semibold text-slate-700 text-sm">{t.noDatesTitle}</p>
                                                            <p className="text-[10px] text-slate-500">{t.noDatesDesc}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100 text-center">
                        {isGenerating ? (
                            <div
                                style={getStyleString(state.styles.footer)}
                                dangerouslySetInnerHTML={{ __html: state.styles.footerText }}
                            />
                        ) : (
                            <textarea
                                className="w-full bg-transparent border-none outline-none resize-none overflow-hidden text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:bg-black/5 dark:focus:bg-white/5 rounded px-2"
                                style={{
                                    ...getStyleString(state.styles.footer),
                                    minHeight: '60px'
                                }}
                                value={state.styles.footerText.replace(/<br\s*\/?>/gi, '\n')}
                                onChange={(e) => {
                                    // Convert line breaks back to <br> for HTML rendering compatibility
                                    const htmlText = e.target.value.replace(/\n/g, '<br/>');
                                    updateState({ styles: { ...state.styles, footerText: htmlText } });
                                    // Auto-resize
                                    e.target.style.height = 'auto';
                                    e.target.style.height = (e.target.scrollHeight) + 'px';
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Datalist for names history auto-complete */}
                <datalist id="name-suggestions">
                    {nameHistory.map((name, i) => (
                        <option key={i} value={name} />
                    ))}
                </datalist>
            </div>
        </div>
    );
};