import React, { useState } from 'react';
import { AppState, MonthData, TemplateType, WeekData } from '../types';
import { TRANSLATIONS, getMonthName } from '../constants';
import { PlusCircle, Trash2, ChevronDown, ChevronUp, Upload, Plus, Check } from 'lucide-react';
import { Select } from './Select';

interface Props {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

export const ContentControl: React.FC<Props> = ({ state, updateState }) => {
  const t = TRANSLATIONS[state.language];
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});
  const [openWeeks, setOpenWeeks] = useState<Record<string, boolean>>({});

  const monthColors = [
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
    'bg-rose-500', 'bg-orange-500', 'bg-amber-500',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-sky-500', 'bg-purple-500', 'bg-pink-500'
  ];

  const monthBorderColors = [
    'border-l-blue-500', 'border-l-indigo-500', 'border-l-violet-500',
    'border-l-rose-500', 'border-l-orange-500', 'border-l-amber-500',
    'border-l-emerald-500', 'border-l-teal-500', 'border-l-cyan-500',
    'border-l-sky-500', 'border-l-purple-500', 'border-l-pink-500'
  ];

  const toggleMonth = (id: string) => {
    setOpenMonths(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleWeek = (id: string) => {
    setOpenWeeks(prev => {
      const isOpen = prev[id] === undefined ? true : prev[id];
      return { ...prev, [id]: !isOpen };
    });
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateState({
            banner: {
              ...state.banner,
              image: event.target.result as string,
              x: 0,
              y: 0,
              zoom: 1
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addMonth = () => {
    if (state.template === 'acomodadores' && state.months.length >= 3) {
      return;
    }

    // Determine the next month based on the last month in the list
    let nextYear = new Date().getFullYear();
    let nextMonthIndex = new Date().getMonth();

    if (state.months.length > 0) {
      const lastMonth = state.months[state.months.length - 1];
      nextMonthIndex = lastMonth.monthIndex + 1;
      nextYear = lastMonth.year;

      if (nextMonthIndex > 11) {
        nextMonthIndex = 0;
        nextYear++;
      }
    }

    const newMonth: MonthData = {
      id: crypto.randomUUID(),
      year: nextYear,
      monthIndex: nextMonthIndex,
      selectedDays: [],
      weeks: Array.from({ length: 5 }).map(() => ({
        id: crypto.randomUUID(),
        door: '',
        auditorium: '',
        mic1: '',
        mic2: '',
        group: ''
      }))
    };
    updateState({ months: [...state.months, newMonth] });
    setOpenMonths(prev => ({ ...prev, [newMonth.id]: true }));
  };

  const removeMonth = (id: string) => {
    updateState({ months: state.months.filter(m => m.id !== id) });
  };

  const updateMonth = (id: string, updates: Partial<MonthData>) => {
    updateState({
      months: state.months.map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const toggleDay = (monthId: string, dayIndex: number) => {
    const month = state.months.find(m => m.id === monthId);
    if (!month) return;

    const newSelectedDays = month.selectedDays.includes(dayIndex)
      ? month.selectedDays.filter(d => d !== dayIndex)
      : [...month.selectedDays, dayIndex].sort(); // Sort for consistent order

    updateMonth(monthId, { selectedDays: newSelectedDays });
  };

  const updateWeek = (monthId: string, weekId: string, field: keyof WeekData, value: string) => {
    const month = state.months.find(m => m.id === monthId);
    if (!month) return;

    const newWeeks = month.weeks.map(w => w.id === weekId ? { ...w, [field]: value } : w);
    updateMonth(monthId, { weeks: newWeeks });
  };

  const addWeek = (monthId: string) => {
    const month = state.months.find(m => m.id === monthId);
    if (!month) return;
    const newWeek = {
      id: crypto.randomUUID(),
      door: '',
      auditorium: '',
      mic1: '',
      mic2: '',
      group: ''
    };
    updateMonth(monthId, { weeks: [...month.weeks, newWeek] });
  };

  const removeWeek = (monthId: string, weekId: string) => {
    const month = state.months.find(m => m.id === monthId);
    if (!month) return;
    updateMonth(monthId, { weeks: month.weeks.filter(w => w.id !== weekId) });
  };



  return (
    <div className="space-y-8 pb-10">

      {/* Section: Configuration */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Configuración</h3>

        {/* Template Selector */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">
            {t.selectTemplate}
          </label>
          <Select
            options={[
              { value: 'acomodadores', label: t.templateUshers },
              { value: 'aseo', label: t.templateCleaning }
            ]}
            value={state.template}
            onChange={(value) => updateState({ template: value as TemplateType })}
          />
        </div>

        {/* Banner Upload */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-white/5">
          <label className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase">
            {t.banner}
          </label>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="banner-upload"
              onChange={handleBannerUpload}
            />
            <label
              htmlFor="banner-upload"
              className={`flex items-center justify-center gap-3 w-full p-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-all ${state.banner.image
                ? 'border-green-300 dark:border-green-800/50 hover:border-green-500 bg-green-50/30 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'border-red-300 dark:border-red-800/50 hover:border-red-500 bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${state.banner.image
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                {state.banner.image ? <Check size={16} /> : <Upload size={16} />}
              </div>
              <span className={`text-xs font-medium ${state.banner.image ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {state.banner.image ? 'Banner Activo' : t.uploadBanner}
              </span>
            </label>
            {state.banner.image && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  updateState({ banner: { ...state.banner, image: null } });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-green-600 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors z-10"
                title="Eliminar Banner"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section: Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Programación</h3>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{state.months.length} Meses</span>
        </div>

        <div className="space-y-5">
          {state.months.map((month, index) => (
            <div key={month.id} className={`group border border-zinc-200 dark:border-white/5 rounded-xl bg-white dark:bg-zinc-800/40 shadow-sm hover:shadow-md transition-shadow border-l-4 ${monthBorderColors[month.monthIndex % 12]}`}>

              {/* Month Header */}
              <div
                className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors rounded-tr-xl ${openMonths[month.id] ? 'bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                onClick={() => toggleMonth(month.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ${monthColors[month.monthIndex % 12]}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-[15px] text-black dark:text-white tracking-tight">
                      {getMonthName(month.monthIndex, state.language)} {month.year}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium tracking-wide uppercase mt-0.5">{month.weeks.length} Semanas</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeMonth(month.id); }}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title={t.remove}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className={`transition-transform duration-200 ${openMonths[month.id] ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} className="text-zinc-400" />
                  </div>
                </div>
              </div>

              {openMonths[month.id] && (
                <div className="p-4 space-y-5 animate-in slide-in-from-top-2 duration-200">
                  {/* Visual Connector Line */}

                  {/* Year/Month Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">{t.year}</span>
                      <Select
                        options={Array.from({ length: 7 }, (_, i) => {
                          const year = new Date().getFullYear() - 1 + i;
                          return { value: year, label: String(year) };
                        })}
                        value={month.year}
                        onChange={(value) => updateMonth(month.id, { year: parseInt(value) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">{t.month}</span>
                      <div className="relative">
                        <Select
                          options={Array.from({ length: 12 }, (_, i) => ({
                            value: i,
                            label: getMonthName(i, state.language)
                          }))}
                          value={month.monthIndex}
                          onChange={(value) => updateMonth(month.id, { monthIndex: parseInt(value) })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Day Selector */}
                  <div className="bg-zinc-50 dark:bg-black/20 p-3 rounded-xl border border-dashed border-zinc-200 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 mb-2 block text-center">{t.meetingDay}</span>
                    <div className="flex justify-between gap-1">
                      {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                        <button
                          key={i}
                          onClick={() => toggleDay(month.id, i)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${month.selectedDays.includes(i)
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                            : 'bg-white dark:bg-zinc-800 text-zinc-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-zinc-700'
                            }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weeks Data */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Semanas</span>
                    </div>

                    {month.weeks.map((week, idx) => (
                      <div key={week.id} className="border-l-2 border-zinc-100 dark:border-zinc-800 hover:border-primary/50 transition-colors pl-3">
                        <div
                          className="flex items-center justify-between py-2 cursor-pointer select-none group/week"
                          onClick={() => toggleWeek(week.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold uppercase transition-colors ${openWeeks[week.id] ? 'text-primary' : 'text-zinc-500 group-hover/week:text-zinc-700 dark:group-hover/week:text-zinc-300'}`}>
                              {t.week} {idx + 1}
                            </span>
                            <div className={`transition-transform duration-200 ${openWeeks[week.id] ? 'rotate-180' : ''}`}>
                              <ChevronDown size={14} className="text-zinc-400 group-hover/week:text-primary transition-colors" />
                            </div>
                          </div>

                          <button
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all opacity-0 group-hover/week:opacity-100"
                            onClick={(e) => { e.stopPropagation(); removeWeek(month.id, week.id); }}
                            title={t.remove}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {(openWeeks[week.id] === undefined || openWeeks[week.id]) && (
                          <div className="pb-3 grid grid-cols-2 gap-2.5 animate-in slide-in-from-left-2 duration-200">
                            {state.template === 'acomodadores' ? (
                              <>
                                <label className="col-span-1 space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{t.door}</span>
                                  <input
                                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs h-8 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={week.door}
                                    onChange={(e) => updateWeek(month.id, week.id, 'door', e.target.value)}
                                  />
                                </label>
                                <label className="col-span-1 space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{t.auditorium}</span>
                                  <input
                                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black/20 text-xs h-8 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={week.auditorium}
                                    onChange={(e) => updateWeek(month.id, week.id, 'auditorium', e.target.value)}
                                  />
                                </label>
                                <label className="col-span-1 space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{t.mic1}</span>
                                  <input
                                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs h-8 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={week.mic1}
                                    onChange={(e) => updateWeek(month.id, week.id, 'mic1', e.target.value)}
                                  />
                                </label>
                                <label className="col-span-1 space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{t.mic2}</span>
                                  <input
                                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs h-8 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    value={week.mic2}
                                    onChange={(e) => updateWeek(month.id, week.id, 'mic2', e.target.value)}
                                  />
                                </label>
                              </>
                            ) : (
                              <label className="col-span-2 space-y-1">
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{t.groupName}</span>
                                <input
                                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs h-9 px-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                  value={week.group}
                                  onChange={(e) => updateWeek(month.id, week.id, 'group', e.target.value)}
                                  placeholder="Grupo..."
                                />
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => addWeek(month.id)}
                      className="w-full py-2 text-xs font-bold text-primary border border-dashed border-primary/30 rounded-lg hover:bg-primary/5 flex items-center justify-center gap-1.5 transition-all mt-2"
                    >
                      <Plus size={14} /> {t.addWeek}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="space-y-2">
            <button
              onClick={addMonth}
              disabled={state.template === 'acomodadores' && state.months.length >= 3}
              className={`w-full py-3 rounded-lg border-2 border-dashed font-bold flex items-center justify-center gap-2 transition-all group ${state.template === 'acomodadores' && state.months.length >= 3
                ? 'border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                : 'border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-primary hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm ${state.template === 'acomodadores' && state.months.length >= 3
                ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700'
                : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary group-hover:text-white'
                }`}>
                <Plus size={14} />
              </div>
              <span className="text-xs uppercase tracking-wide">{t.createNewMonth}</span>
            </button>

            {state.template === 'acomodadores' && state.months.length >= 3 && (
              <p className="text-[10px] text-center text-amber-600 dark:text-amber-500 font-medium px-2">
                Límite de 3 meses alcanzado para esta plantilla.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};