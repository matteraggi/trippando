import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, WifiOff, X } from 'lucide-react';

export default function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900/90 text-white p-4 rounded-xl shadow-lg z-[100] backdrop-blur-sm border border-gray-700 animate-fade-in-up">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                    <div className="mt-1">
                        {offlineReady ? <WifiOff size={20} className="text-green-400" /> : <RefreshCw size={20} className="text-blue-400" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm mb-1">
                            {offlineReady ? 'Pronto per l\'offline' : 'Aggiornamento disponibile'}
                        </h3>
                        <p className="text-xs text-gray-300">
                            {offlineReady
                                ? 'L\'app è pronta per essere utilizzata offline.'
                                : 'Nuovi contenuti disponibili, ricarica per aggiornare.'}
                        </p>
                    </div>
                </div>
                <button onClick={close} className="text-gray-400 hover:text-white">
                    <X size={18} />
                </button>
            </div>

            {needRefresh && (
                <button
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                    onClick={() => updateServiceWorker(true)}
                >
                    Ricarica ora
                </button>
            )}
        </div>
    );
}
