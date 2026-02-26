import React, { useState, useEffect } from 'react';
import { LayoutGrid, Moon, Sun, Download, Printer, Settings, Palette, FileText, Languages, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { AppState, StylesState, Language } from './types';
import { INITIAL_STYLES, TRANSLATIONS, THEME_COLORS } from './constants';
import { ContentControl } from './components/ContentControl';
import { StyleControl } from './components/StyleControl';
import { Preview } from './components/Preview';

export default function App() {
  const [activeTab, setActiveTab] = useState<'content' | 'styles'>('content');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [openStyles, setOpenStyles] = useState<Record<string, boolean>>({ title: false, header: false, cell: false, footer: false });
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [state, setState] = useState<AppState>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('HUB_TEOCRATICO_STATE_V1') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          template: 'acomodadores',
          months: [],
          styles: INITIAL_STYLES,
          banner: { image: null, zoom: 1, x: 0, y: 0 },
          language: 'es',
          theme: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
          colorTheme: 'blue',
          ...parsed
        };
      } catch (e) {
        console.error("Error loading state:", e);
      }
    }
    return {
      template: 'acomodadores',
      months: [],
      styles: INITIAL_STYLES,
      banner: { image: null, zoom: 1, x: 0, y: 0 },
      language: 'es',
      theme: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      colorTheme: 'blue'
    };
  });

  useEffect(() => {
    localStorage.setItem('HUB_TEOCRATICO_STATE_V1', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Close menus on click outside
  useEffect(() => {
    const closeMenu = () => {
      setIsLangMenuOpen(false);
      setIsThemeMenuOpen(false);
    };
    if (isLangMenuOpen || isThemeMenuOpen) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [isLangMenuOpen, isThemeMenuOpen]);

  useEffect(() => {
    const themeColor = THEME_COLORS.find(c => c.id === state.colorTheme) || THEME_COLORS[0];
    document.documentElement.style.setProperty('--color-primary', themeColor.rgb);
  }, [state.colorTheme]);

  useEffect(() => {
    if (state.months.length === 0) {
      setState(prev => ({
        ...prev,
        months: [{
          id: crypto.randomUUID(),
          year: new Date().getFullYear(),
          monthIndex: new Date().getMonth(),
          selectedDays: [],
          weeks: Array.from({ length: 5 }).map(() => ({
            id: crypto.randomUUID(),
            door: '', auditorium: '', mic1: '', mic2: '', group: ''
          }))
        }]
      }));
    }
  }, []);

  const t = TRANSLATIONS[state.language];

  const updateState = React.useCallback((updates: Partial<AppState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      if (newState.template === 'acomodadores' && newState.months.length > 3) {
        newState.months = newState.months.slice(0, 3);
      }
      return newState;
    });
  }, []);

  const updateStyle = React.useCallback((section: keyof StylesState, config: any) => {
    setState(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [section]: config
      }
    }));
  }, []);

  const toggleStyle = React.useCallback((section: string) => {
    setOpenStyles(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const resetState = () => {
    const initialState: AppState = {
      template: 'acomodadores',
      months: [{
        id: crypto.randomUUID(),
        year: new Date().getFullYear(),
        monthIndex: new Date().getMonth(),
        selectedDays: [],
        weeks: Array.from({ length: 5 }).map(() => ({
          id: crypto.randomUUID(),
          door: '', auditorium: '', mic1: '', mic2: '', group: ''
        }))
      }],
      styles: INITIAL_STYLES,
      banner: { image: null, zoom: 1, x: 0, y: 0 },
      language: 'es',
      theme: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      colorTheme: 'blue'
    };
    setState(initialState);
    localStorage.removeItem('HUB_TEOCRATICO_STATE_V1');
    setIsResetModalOpen(false);
  };

  const handlePrint = () => {
    const content = document.getElementById('pdf-content');
    if (!content) return;

    // @ts-ignore
    if (typeof window.html2pdf !== 'undefined') {
      const opt = {
        margin: 0,
        filename: 'program.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
        jsPDF: { unit: 'px', format: [816, 1056], orientation: 'portrait' }
      };
      // @ts-ignore
      window.html2pdf().from(content).set(opt).toPdf().get('pdf').then((pdf: any) => {
        window.open(pdf.output('bloburl'), '_blank');
      });
    } else {
      window.print();
    }
  };

  const downloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const content = document.getElementById('pdf-content');
      if (!content) {
        alert('No se pudo encontrar el contenido para exportar');
        return;
      }

      // @ts-ignore
      if (typeof window.html2pdf === 'undefined') {
        alert('La librería html2pdf no está disponible. Por favor recarga la página.');
        return;
      }

      // Save original transform and remove it temporarily
      const originalTransform = content.style.transform;
      const originalTransformOrigin = content.style.transformOrigin;
      content.style.transform = 'none';
      content.style.transformOrigin = 'top left';

      // Wait a bit for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const opt = {
        margin: 0,
        filename: `programa-${state.template}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'png', quality: 1.0 },
        html2canvas: {
          scale: 3,
          dpi: 300,
          useCORS: true,
          allowTaint: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff',
          width: 816,
          height: 1056,
          windowWidth: 816,
          windowHeight: 1056,
          imageTimeout: 0,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc: Document) => {
            const clonedElement = clonedDoc.getElementById('pdf-content');
            if (clonedElement) {
              clonedElement.style.transform = 'none';
              clonedElement.style.transformOrigin = 'top left';
              (clonedElement.style as any).fontSmooth = 'always';
              (clonedElement.style as any).webkitFontSmoothing = 'antialiased';
              (clonedElement.style as any).MozOsxFontSmoothing = 'grayscale';
            }
          }
        },
        jsPDF: {
          unit: 'px',
          format: [816, 1056],
          orientation: 'portrait',
          compress: true,
          precision: 16,
          putOnlyUsedFonts: true,
          floatPrecision: 16
        }
      };

      // @ts-ignore
      await window.html2pdf().from(content).set(opt).save();

      // Restore original transform
      content.style.transform = originalTransform;
      content.style.transformOrigin = originalTransformOrigin;

    } catch (err: any) {
      console.error("PDF Export Error:", err);
      alert(`Error al exportar PDF: ${err.message || 'Error desconocido'}.`);

      const content = document.getElementById('pdf-content');
      if (content) {
        content.style.transform = content.style.transform || 'scale(1)';
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'ru', label: 'Русский' },
    { code: 'pl', label: 'Polski' }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-sans flex flex-col">
      {/* Navbar */}
      <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutGrid className="text-white" size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Hub Teocrático JW
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium uppercase tracking-widest">Editor de Programaciones</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile View Toggle */}
          <div className="flex min-[1050px]:hidden p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
            <button
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mobileView === 'editor' ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm' : 'text-zinc-500'}`}
              onClick={() => setMobileView('editor')}
            >
              Editor
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mobileView === 'preview' ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm' : 'text-zinc-500'}`}
              onClick={() => setMobileView('preview')}
            >
              Vista Previa
            </button>
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

          {/* Theme & Extras */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsLangMenuOpen(!isLangMenuOpen); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-white/5"
              >
                <Languages size={18} className="text-zinc-500 dark:text-zinc-400" />
                <span className="text-sm font-medium uppercase">{state.language}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-white/5 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { updateState({ language: lang.code }); setIsLangMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors ${state.language === lang.code ? 'text-primary font-bold bg-primary/5' : 'text-zinc-600 dark:text-zinc-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">{lang.code}</span>
                        <span>{lang.label}</span>
                      </div>
                      {state.language === lang.code && <Check size={16} className="text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>


            <button
              onClick={() => updateState({ theme: state.theme === 'light' ? 'dark' : 'light' })}
              className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all active:scale-95"
            >
              {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              onClick={() => setIsResetModalOpen(true)}
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all active:scale-95"
              title="Restablecer App"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`w-full min-[1050px]:w-[320px] flex-shrink-0 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-white/5 z-10 ${mobileView === 'preview' ? 'hidden min-[1050px]:flex' : 'flex'}`}>
          <div className="flex border-b border-zinc-200 dark:border-white/5">
            <button
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              onClick={() => setActiveTab('content')}
            >
              <FileText size={18} />
              {t.content}
            </button>
            <button
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'styles' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              onClick={() => setActiveTab('styles')}
            >
              <Palette size={18} />
              {t.styles}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
            {activeTab === 'content' ? (
              <ContentControl state={state} updateState={updateState} />
            ) : (
              <div className="space-y-4">
                <StyleControl
                  title={t.mainTitle} config={state.styles.title}
                  onChange={(c) => updateStyle('title', c)}
                  isOpen={openStyles.title} onToggle={() => toggleStyle('title')}
                  maxSize={46}
                  accentColor="#3b82f6"
                />
                <StyleControl
                  title={t.tableHeaders} config={state.styles.header}
                  onChange={(c) => updateStyle('header', c)}
                  isOpen={openStyles.header} onToggle={() => toggleStyle('header')}
                  showBackground maxSize={14}
                  accentColor="#10b981"
                />
                <StyleControl
                  title={t.cellContent} config={state.styles.cell}
                  onChange={(c) => updateStyle('cell', c)}
                  isOpen={openStyles.cell} onToggle={() => toggleStyle('cell')}
                  accentColor="#f59e0b"
                />
                <StyleControl
                  title={t.footer} config={state.styles.footer}
                  onChange={(c) => updateStyle('footer', c)}
                  isOpen={openStyles.footer} onToggle={() => toggleStyle('footer')}
                  accentColor="#f43f5e"
                />
                <div className="space-y-2 p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{t.footerText}</label>
                  <textarea
                    className="w-full bg-white dark:bg-zinc-800 border-zinc-200 dark:border-white/5 rounded-lg text-sm p-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[100px] resize-none"
                    value={state.styles.footerText}
                    onChange={(e) => updateStyle('footerText', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className={`flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-y-auto p-4 md:p-12 scrollbar-thin ${mobileView === 'editor' ? 'hidden min-[1050px]:block' : 'block'}`}>
          <div className="max-w-[210mm] mx-auto scale-[0.6] sm:scale-[0.8] md:scale-100 origin-top transition-transform duration-500 pb-20 md:pb-0">
            <Preview state={state} updateState={updateState} isGenerating={isGeneratingPDF} />
          </div>
        </main>

        {/* Floating Action Buttons */}
        <div className={`fixed bottom-6 right-6 flex flex-col gap-3 z-40 print:hidden transition-all duration-300 ${mobileView === 'editor' && 'max-[1050px]:hidden'}`}>
          <button
            onClick={handlePrint}
            className="w-14 h-14 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-primary rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-zinc-200 dark:border-white/10"
            title="Imprimir"
          >
            <Printer size={24} />
          </button>
          <button
            onClick={downloadPDF}
            disabled={isGeneratingPDF}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-primary/40 disabled:opacity-50"
            title="Descargar PDF"
          >
            {isGeneratingPDF ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={24} />
            )}
          </button>
        </div>

        {
          isGeneratingPDF && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 border border-zinc-200 dark:border-white/10 animate-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <Download className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Generando PDF</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Por favor espera un momento...</p>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {
          isResetModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center shadow-inner">
                    <RotateCcw size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Confirmar reinicio</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">¿Estás seguro de que quieres restablecer la app? No se puede deshacer.</p>
                  </div>
                  <div className="flex flex-col w-full gap-2 mt-2">
                    <button onClick={resetState} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/20">Sí, restablecer todo</button>
                    <button onClick={() => setIsResetModalOpen(false)} className="w-full py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all">Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
