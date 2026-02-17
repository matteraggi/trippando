import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export default function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = (evt: React.MouseEvent) => {
        evt.preventDefault();
        if (promptInstall) {
            promptInstall.prompt();
        } else if (isIOS) {
            setShowIOSInstructions(true);
        }
    };

    if (!supportsPWA && !isIOS) {
        return null;
    }

    return (
        <>
            <button
                className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 text-sm font-bold animate-fade-in-up"
                onClick={onClick}
            >
                <Download size={16} />
                Installa App
            </button>

            {/* iOS Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl relative animate-slide-up">
                        <button
                            onClick={() => setShowIOSInstructions(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Installa su iPhone</h3>
                            <p className="text-sm text-gray-500 mt-1">Segui questi passi per aggiungere l'app alla Home</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-left">
                                <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-bold text-gray-600 shrink-0">1</span>
                                <p className="text-sm text-gray-700">Tocca il pulsante <span className="font-bold inline-flex items-center gap-1"><Share size={14} className="text-blue-600" /> Condividi</span> nella barra in basso.</p>
                            </div>
                            <div className="flex items-center gap-4 text-left">
                                <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-bold text-gray-600 shrink-0">2</span>
                                <p className="text-sm text-gray-700">Scorri e seleziona <span className="font-bold inline-flex items-center gap-1"><PlusSquare size={14} /> Aggiungi alla Schermata Home</span>.</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowIOSInstructions(false)}
                                className="text-blue-600 font-semibold text-sm"
                            >
                                Ho capito
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
