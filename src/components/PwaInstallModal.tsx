import React, { useState, useEffect } from 'react';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  X,
  Smartphone,
  Monitor,
  Share,
  PlusSquare,
  ShieldCheck,
  WifiOff,
  Zap,
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallAccepted?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallAccepted,
}) => {
  const [isIframe, setIsIframe] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'desktop' | 'android' | 'ios'>('desktop');
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    // Check if running inside an iframe
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }

    // Check if already installed / standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Auto-detect device platform
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) {
      setSelectedPlatform('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setSelectedPlatform('ios');
    } else {
      setSelectedPlatform('desktop');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    if (deferredPrompt) {
      setIsPrompting(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (onInstallAccepted) onInstallAccepted();
          onClose();
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      } finally {
        setIsPrompting(false);
      }
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="pwa-install-modal-content"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#006633] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <Download className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Install GHS M&E System</h3>
              <p className="text-[11px] text-green-200">Offline-Ready Progressive Web Application (PWA)</p>
            </div>
          </div>
          <button
            id="close-pwa-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-green-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Standalone Status */}
          {isStandalone && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong>Already Installed:</strong> You are currently running the app in standalone mode.</span>
            </div>
          )}

          {/* Iframe Notice (Critical explanation for AI Studio preview vs Direct Tab) */}
          {isIframe && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-lg space-y-2 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-start space-x-2">
                <ExternalLink className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Why the Address Bar Install icon requires a Full Browser Tab:</p>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                    Browsers (Chrome, Edge, Safari) deliberately disable the address bar install prompt inside embedded preview iframes for security. Open the app in its own browser tab to enable direct 1-click address bar installation.
                  </p>
                </div>
              </div>
              <button
                id="open-tab-for-install-btn"
                type="button"
                onClick={handleOpenInNewTab}
                className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-md flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Browser Tab to Install</span>
              </button>
            </div>
          )}

          {/* 1-Click Browser Install Trigger (when beforeinstallprompt is ready) */}
          {deferredPrompt && (
            <button
              id="direct-pwa-install-btn"
              type="button"
              onClick={handleDirectInstall}
              disabled={isPrompting}
              className="w-full py-2.5 px-4 bg-[#006633] hover:bg-[#005528] text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FFD700]" />
              <span>{isPrompting ? 'Opening Prompt...' : 'Click Here to Install Directly'}</span>
            </button>
          )}

          {/* Platform Guide Tabs */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              How to Install from the Address Bar / Menu:
            </label>
            <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setSelectedPlatform('desktop')}
                className={`flex-1 py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                  selectedPlatform === 'desktop'
                    ? 'border-[#006633] text-[#006633] dark:border-emerald-400 dark:text-emerald-400 bg-green-50/50 dark:bg-slate-800/50'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Chrome / Edge (PC/Mac)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatform('android')}
                className={`flex-1 py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                  selectedPlatform === 'android'
                    ? 'border-[#006633] text-[#006633] dark:border-emerald-400 dark:text-emerald-400 bg-green-50/50 dark:bg-slate-800/50'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatform('ios')}
                className={`flex-1 py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                  selectedPlatform === 'ios'
                    ? 'border-[#006633] text-[#006633] dark:border-emerald-400 dark:text-emerald-400 bg-green-50/50 dark:bg-slate-800/50'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Share className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            {/* Platform Instructions Details */}
            <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              {selectedPlatform === 'desktop' && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <p>Open the app in a standalone tab (using the button above).</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <p>Look at the <strong>right side of your Chrome/Edge address bar</strong> for the <strong>Install icon (💻 or ⊕)</strong>.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <p>Or click the <strong>3-dots menu (⋮)</strong> in Chrome $\rightarrow$ <strong>"Save and share"</strong> $\rightarrow$ <strong>"Install Ghana Health Service M&E System"</strong>.</p>
                  </div>
                </div>
              )}

              {selectedPlatform === 'android' && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <p>In Chrome on Android, tap the <strong>three dots menu (⋮)</strong> at the top right.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <p>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <p>Follow the on-screen prompt to place the official GHS icon on your home screen.</p>
                  </div>
                </div>
              )}

              {selectedPlatform === 'ios' && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <p>In Apple Safari, tap the <strong>Share button</strong> (<Share className="w-3.5 h-3.5 inline text-blue-500" />) at the bottom toolbar.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <p>Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline" />).</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <p>Tap <strong>"Add"</strong> in the top right corner.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* App Key Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <WifiOff className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Offline Ready</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Launch</span>
            </div>
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006633] dark:text-emerald-400" />
              <span>GHS Encrypted</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            id="close-pwa-modal-footer-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
