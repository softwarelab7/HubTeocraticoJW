import { useState, useEffect } from 'react';

export function useVersionCheck() {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [initialVersion, setInitialVersion] = useState<string | null>(null);

    useEffect(() => {
        // 1. Obtener la versión inicial al cargar la app
        const fetchInitialVersion = async () => {
            try {
                const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    setInitialVersion(data.version);
                }
            } catch (error) {
                console.error('Error fetching initial version:', error);
            }
        };

        fetchInitialVersion();
    }, []);

    useEffect(() => {
        if (!initialVersion) return;

        // 2. Función para comprobar si hay una nueva versión
        const checkForUpdate = async () => {
            try {
                const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.version && data.version !== initialVersion) {
                        setIsUpdateAvailable(true);
                    }
                }
            } catch (error) {
                console.error('Error checking for update:', error);
            }
        };

        // 3. Comprobar periódicamente (cada 5 minutos)
        const intervalId = setInterval(checkForUpdate, 5 * 60 * 1000);

        // 4. Comprobar cuando la pestaña vuelve a ser visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkForUpdate();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [initialVersion]);

    return isUpdateAvailable;
}
