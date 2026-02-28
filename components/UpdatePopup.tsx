import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface UpdatePopupProps {
    isUpdateAvailable: boolean;
}

export function UpdatePopup({ isUpdateAvailable }: UpdatePopupProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isUpdateAvailable) {
            setIsVisible(true);
        }
    }, [isUpdateAvailable]);

    if (!isVisible) return null;

    const handleUpdate = () => {
        // Forzar la recarga ignorando la caché (el booleano true está deprecado en algunos navegadores modernos
        // pero funciona junto con las cabeceras implementadas y los query params).
        window.location.reload();
    };

    return (
        <div className="fixed bottom-6 left-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 print:hidden">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-4 pr-12 border border-zinc-200 dark:border-white/10 max-w-sm relative flex items-start gap-4">

                {/* Ícono animado */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <RefreshCw size={20} className="animate-spin-slow" style={{ animationDuration: '3s' }} />
                </div>

                {/* Contenido */}
                <div className="flex flex-col gap-1.5 pt-0.5">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        ¡Nueva versión disponible!
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Hemos actualizado la aplicación. Por favor, recarga para ver los últimos cambios.
                    </p>
                    <button
                        onClick={handleUpdate}
                        className="mt-2 bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 w-fit"
                    >
                        Actualizar ahora
                    </button>
                </div>

                {/* Botón cerrar (Opcional, pero buena UX para no bloquear) */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Cerrar aviso temporalmente"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
