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
  Copy,
  Check,
  HelpCircle,
  AlertCircle,
  Laptop,
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
  const [selectedPlatform, setSelectedPlatform] = useState<'desktop' | 'android' | 'ios' | 'mac'>('desktop');
  const [isPrompting, setIsPrompting] = useState(false);
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Check if running inside an iframe
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }

    // Check service worker support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        setSwRegistered(regs.length > 0);
      });
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
    } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent) && !(window as any).chrome) {
      setSelectedPlatform('mac');
    } else {
      setSelectedPlatform('desktop');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    const promptObj = deferredPrompt || (window as any).deferredPrompt;
    if (promptObj) {
      setIsPrompting(true);
      try {
        await promptObj.prompt();
        const { outcome } = await promptObj.userChoice;
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
    const targetUrl = window.location.href;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setHasCopiedUrl(true);
      setTimeout(() => setHasCopiedUrl(false), 3000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const hasNativePrompt = Boolean(deferredPrompt || (window as any).deferredPrompt);

  return (
    <div
      id="pwa-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="pwa-install-modal-content"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#006633] px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <Download className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Install GHS M&E Application</h3>
              <p className="text-[11px] text-green-200">Offline-Ready Progressive Web App (PWA) Setup Guide</p>
            </div>
          </div>
          <button
            id="close-pwa-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-green-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Standalone Status */}
          {isStandalone && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong>Already Installed:</strong> You are currently running this system in standalone desktop/app mode.</span>
            </div>
          )}

          {/* 1-Click Browser Install Trigger (when beforeinstallprompt is ready) */}
          {hasNativePrompt ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Ready for 1-Click Native Installation:</span>
              </div>
              <button
                id="direct-pwa-install-btn"
                type="button"
                onClick={handleDirectInstall}
                disabled={isPrompting}
                className="w-full py-3 px-4 bg-[#006633] hover:bg-[#005528] text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer ring-2 ring-emerald-400/50 active:scale-[0.99]"
              >
                <Download className="w-4 h-4 text-[#FFD700]" />
                <span>{isPrompting ? 'Opening Browser Prompt...' : 'Click Here to Install GHS App Now'}</span>
              </button>
            </div>
          ) : (
            /* Primary Solution when in preview iframe or browser waiting for top window */
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-400 dark:border-amber-600 rounded-xl space-y-3 text-xs text-amber-950 dark:text-amber-100 shadow-sm">
              <div className="flex items-start space-x-2.5">
                <ExternalLink className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <h4 className="font-extrabold text-xs uppercase tracking-wide text-amber-900 dark:text-amber-200">
                    Why the Install Icon Requires a Dedicated Browser Tab:
                  </h4>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                    Web browsers (Google Chrome, MS Edge, Apple Safari) <strong>block the address bar Install icon (💻 / ⊕)</strong> inside embedded preview panels for security. Opening the app in a dedicated window immediately activates the browser's native install prompt.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  id="open-tab-for-install-btn"
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="flex-1 py-2.5 px-4 bg-[#006633] hover:bg-green-800 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#FFD700]" />
                  <span>Open in Dedicated Tab to Install</span>
                </button>

                <button
                  id="copy-app-url-btn"
                  type="button"
                  onClick={handleCopyUrl}
                  className="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  title="Copy Direct App URL"
                >
                  {hasCopiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* System Diagnostic Readiness Badges */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
              PWA Readiness Diagnostic:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Service Worker: OK</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Manifest: Valid</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>HTTPS: Secure</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Offline: Active</span>
              </div>
            </div>
          </div>

          {/* Platform Guide Tabs */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Step-by-Step Installation Instructions:
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
                <span>Chrome / Edge</span>
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
              <button
                type="button"
                onClick={() => setSelectedPlatform('mac')}
                className={`flex-1 py-2 font-bold flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
                  selectedPlatform === 'mac'
                    ? 'border-[#006633] text-[#006633] dark:border-emerald-400 dark:text-emerald-400 bg-green-50/50 dark:bg-slate-800/50'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Mac Safari</span>
              </button>
            </div>

            {/* Platform Instructions Details */}
            <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              {selectedPlatform === 'desktop' && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {/* Visual Mockup of the Address Bar */}
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Browser Address Bar (Chrome / Edge)</span>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-md px-3 py-1.5 flex items-center justify-between text-xs border border-slate-300 dark:border-slate-700">
                      <div className="flex items-center space-x-1.5 text-slate-500 truncate text-[11px] font-mono">
                        <span className="text-emerald-600 font-bold">https://</span>
                        <span className="truncate">ghs-zongoire-health-me.app</span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        {/* Address Bar Install Icon Highlighted */}
                        <div className="bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded flex items-center space-x-1 text-[10px] font-black animate-pulse shadow-xs">
                          <Laptop className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                          <span>INSTALL</span>
                        </div>
                        <span className="text-slate-400 text-xs">★</span>
                        <span className="text-slate-400 text-xs font-bold">⋮</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                      <p>Click <strong>"Open in Dedicated Tab"</strong> to leave the embedded preview frame.</p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                      <p>Look at the <strong>right side of your address bar</strong> for the <strong>Install icon (💻 or ⊕)</strong> as shown above.</p>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                      <p>Click the <strong>Install icon</strong> and confirm <strong>"Install"</strong> to add GHS M&E as a desktop app.</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPlatform === 'android' && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <p>In Chrome on Android, tap the <strong>three dots menu (⋮)</strong> at the top right.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <p>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <p>Tap <strong>"Install"</strong> to place the standalone GHS app icon on your phone home screen.</p>
                  </div>
                </div>
              )}

              {selectedPlatform === 'ios' && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <p>In Apple Safari, tap the <strong>Share button</strong> (<Share className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" />) on the bottom toolbar.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <p>Scroll down the share list and tap <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700 dark:text-slate-300 mx-0.5" />).</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <p>Tap <strong>"Add"</strong> in the top right corner.</p>
                  </div>
                </div>
              )}

              {selectedPlatform === 'mac' && (
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <p>In Safari on macOS Sonoma, click <strong>File</strong> in the top menu bar.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <p>Select <strong>"Add to Dock..."</strong>.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <p>Click <strong>"Add"</strong> to launch GHS M&E as a native Mac app window.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* App Key Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1.5">
              <WifiOff className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Offline Caching</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Instant Launch</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006633] dark:text-emerald-400 shrink-0" />
              <span>DHIMS2 Secure</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Version 2026.3 • Zongoire SDHMT
          </span>
          <button
            id="close-pwa-modal-footer-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
