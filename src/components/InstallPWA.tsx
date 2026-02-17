import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = (evt: React.MouseEvent) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <button
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 text-sm font-bold animate-fade-in-up"
            onClick={onClick}
        >
            <Download size={16} />
            Installa App
        </button>
    );
}
