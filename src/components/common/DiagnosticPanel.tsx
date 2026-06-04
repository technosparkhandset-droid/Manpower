import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, Cpu, Globe, Server, AlertCircle, HelpCircle } from 'lucide-react';

interface DiagnosticResult {
  url: string;
  success: boolean;
  latency?: number;
  statusCode?: number;
  contentType?: string;
  dataFetched?: string;
  error?: string;
  timestamp: string;
}

export const DiagnosticPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiBase, setApiBase] = useState(() => (window as any).__apiBase || '');
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<Record<string, DiagnosticResult>>({});
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [environmentDetails, setEnvironmentDetails] = useState<Record<string, string>>({});

  const loadEnvironmentDetails = () => {
    const details = {
      windowLocationHref: typeof window !== 'undefined' ? window.location.href : '',
      windowLocationOrigin: typeof window !== 'undefined' ? window.location.origin : '',
      windowLocationHost: typeof window !== 'undefined' ? window.location.host : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      detectedApiBase: (window as any).__apiBase || 'Empty (Uses Relative Paths)',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    };
    setEnvironmentDetails(details);
  };

  useEffect(() => {
    loadEnvironmentDetails();
  }, []);

  const runSingleTest = async (testName: string, path: string, fullUrlOverride?: string): Promise<DiagnosticResult> => {
    const base = fullUrlOverride !== undefined ? fullUrlOverride : apiBase;
    const cleanBase = base.replace(/\/$/, '');
    const url = path.startsWith('http') ? path : `${cleanBase}${path}`;
    
    const startTime = performance.now();
    const timestamp = new Date().toLocaleTimeString();

    try {
      // Use original native window.fetch to bypass our custom fetch wrapper to see actual network level results
      const originalFetch = (window as any).fetch?.__originalFetch || window.fetch;
      
      const response = await originalFetch(url, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      const isOk = response.ok;
      const contentType = response.headers.get('content-type') || 'unknown';

      let textPreview = '';
      try {
        const text = await response.text();
        textPreview = text.slice(0, 150) + (text.length > 150 ? '...' : '');
      } catch (e: any) {
        textPreview = '[Could not read body] - ' + e.message;
      }

      return {
        url,
        success: isOk,
        latency,
        statusCode: response.status,
        contentType,
        dataFetched: textPreview,
        timestamp
      };
    } catch (err: any) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      return {
        url,
        success: false,
        latency,
        error: err.message || err.toString(),
        timestamp
      };
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setApiBase((window as any).__apiBase || '');
    loadEnvironmentDetails();

    const newResults: Record<string, DiagnosticResult> = {};

    // 1. Test relative /api/profiles
    newResults['profiles-relative'] = await runSingleTest('Relative Profiles Api', '/api/profiles', '');

    // 2. Test relative /api/health
    newResults['health-relative'] = await runSingleTest('Relative Health Api', '/api/health', '');

    // 3. Test absolute VITE_API_URL or detected API base if present
    const currentBase = (window as any).__apiBase || '';
    if (currentBase) {
      newResults['profiles-absolute'] = await runSingleTest('Absolute Profiles Api', '/api/profiles', currentBase);
      newResults['health-absolute'] = await runSingleTest('Absolute Health Api', '/api/health', currentBase);
    }

    // 4. Test external public fallback to ensure browser allows outgoing requests
    newResults['internet-ping'] = await runSingleTest('Public Connection Ping', 'https://api.github.com/zen', '');

    setResults(newResults);
    setIsTesting(false);
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customApiUrl.trim();
    if (trimmed) {
      (window as any).__apiBase = trimmed;
      setApiBase(trimmed);
      alert(`API URL set to: "${trimmed}". Running diagnostic suite immediately.`);
      runAllTests();
    }
  };

  const handleResetApiUrl = () => {
    let originalBase = '';
    (window as any).__apiBase = originalBase;
    setApiBase(originalBase);
    setCustomApiUrl('');
    alert(`Reset API URL back to default relative root path.`);
    runAllTests();
  };

  // Run automatically when first opening the diagnostics panel
  useEffect(() => {
    if (isOpen) {
      runAllTests();
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs font-bold ${
          isOpen
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
        }`}
        id="diagnostic-toggle-btn"
      >
        <Activity className="w-4 h-4" />
        <span>{isOpen ? 'Close Diagnostics' : 'Diagnose Connection'}</span>
      </button>

      {/* Main Diagnostic Panel Drawer */}
      {isOpen && (
        <div className="absolute right-0 bottom-14 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 mt-2 transition-all duration-300 max-h-[75vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">System Diagnostics</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">API Connection & Latency Tracker</p>
              </div>
            </div>
            <button
              onClick={runAllTests}
              disabled={isTesting}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 disabled:opacity-50 transition-colors"
              title="Refresh / Run Diagnostic Tests Again"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Setup / Override Form */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-2 border border-slate-150 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Globe className="w-3.5 h-3.5" />
                Active base API URL:
              </span>
              <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border dark:border-slate-800">
                {apiBase ? 'OVERRIDE' : 'RELATIVE'}
              </span>
            </div>
            <div className="font-mono text-[10.5px] break-all bg-white dark:bg-slate-950 p-2 rounded border dark:border-slate-850 text-slate-700 dark:text-slate-300">
              {apiBase || '[empty] - uses current origin as relative root'}
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                DYNAMIC OVERRIDE (e.g. https://xyz.run.app):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://your-backend.run.app"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
                <button
                  onClick={handleApplyCustomUrl}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold"
                >
                  Apply
                </button>
              </div>
              {apiBase ? (
                <button
                  onClick={handleResetApiUrl}
                  className="w-full text-center text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline pt-1"
                >
                  Remove Override & Restore Default
                </button>
              ) : null}
            </div>
          </div>

          {/* Test Results */}
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Connectivity Tests</h4>

            {isTesting && (
              <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span>Contacting backends...</span>
              </div>
            )}

            {!isTesting && Object.keys(results).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">No diagnostics executed yet.</p>
            )}

            {!isTesting &&
              Object.entries(results).map(([testId, item]) => {
                const test = item as DiagnosticResult;
                return (
                  <div
                    key={testId}
                    className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850/80 rounded-xl space-y-2 text-xs shadow-sm"
                  >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-extrabold text-slate-800 dark:text-slate-200 capitalize text-[11px] truncate">
                      {testId.replace('-', ' ')}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        test.success
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {test.success ? (
                        <>
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>SUCCESS</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-2.5 h-2.5" />
                          <span>FAILED</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Latency & Metadata */}
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <div>
                      Latency:{' '}
                      <span className={test.latency !== undefined && test.latency > 1000 ? 'text-amber-500 font-bold' : 'text-slate-750 dark:text-slate-250 font-bold'}>
                        {test.latency ? `${test.latency}ms` : 'n/a'}
                      </span>
                    </div>
                    <div>
                      Status:{' '}
                      <span className="font-extrabold text-slate-755 dark:text-slate-245">
                        {test.statusCode || 'N/A'}
                      </span>
                    </div>
                    <div className="col-span-2 truncate">
                      Type: <span className="text-[9.5px]">{test.contentType || 'n/a'}</span>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="font-mono text-[9px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/60 p-1 rounded break-all">
                    URL: {test.url}
                  </div>

                  {/* Payload preview or Error */}
                  {test.success ? (
                    <div className="p-2 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-950/20 rounded text-[10px] font-mono whitespace-pre-wrap break-all text-slate-600 dark:text-slate-350">
                      <strong>Payload Preview:</strong>
                      <div className="mt-1 line-clamp-2 overflow-hidden">{test.dataFetched}</div>
                    </div>
                  ) : (
                    <div className="p-2 bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/40 dark:border-rose-950/20 rounded text-[10.5px] text-rose-600 dark:text-rose-400">
                      <div className="flex gap-1 items-start">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Error details:</strong>
                          <p className="mt-0.5 font-mono text-[9.5px] leading-tight break-all">{test.error}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-[9.5px] text-amber-600 dark:text-amber-450 leading-normal border-t border-rose-100 dark:border-rose-900/30 pt-1.5">
                        💡 <strong>Possible Fix:</strong>
                        {test.error?.includes('Failed to fetch') || test.error?.includes('NetworkError') ? (
                          <p className="mt-0.5">
                            This is a connection refusal. If you are browsing using HTTPS, browser sandboxes strictly prohibit calling 'http://' endpoints (Mixed Content Blocker) or cross-origin requests without correct CORS headers.
                          </p>
                        ) : (
                          <p className="mt-0.5">
                            Please check backend container responsiveness. You can use the Dynamic Override area above to connect to an alternative endpoint.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Browser Context info */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
            <h4 className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Server className="w-3 h-3" />
              Runtime Context
            </h4>
            <div className="grid grid-cols-1 gap-1 text-[9px] font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 p-2 rounded">
              <div className="break-all"><b>Href:</b> {environmentDetails.windowLocationHref}</div>
              <div className="break-all"><b>Host:</b> {environmentDetails.windowLocationHost}</div>
              <div className="break-all"><b>Referrer:</b> {environmentDetails.referrer || '[None]'}</div>
              <div className="break-all"><b>Detected base:</b> {environmentDetails.detectedApiBase}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
