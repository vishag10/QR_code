import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

const DEFAULT_URL = import.meta.env.VITE_EXHIBITION_URL || 'https://yourdomain.com/q/exhibition';

// ── Utility: download element as PNG via canvas ──────────────────────────────
function downloadAsPNG(canvasRef, filename) {
  const canvas = canvasRef.current?.querySelector('canvas');
  if (!canvas) {
    alert('Canvas not found. Please try again.');
    return;
  }
  const url = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
}

// ── Utility: download SVG element as SVG file ─────────────────────────────────
function downloadAsSVG(svgRef, filename) {
  const svgEl = svgRef.current?.querySelector('svg');
  if (!svgEl) {
    alert('SVG not found. Please try again.');
    return;
  }
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Utility: print the QR code area ──────────────────────────────────────────
function printQR() {
  window.print();
}

// ── QR Size options ───────────────────────────────────────────────────────────
const SIZE_OPTIONS = [
  { label: 'Small (128px)', value: 128 },
  { label: 'Medium (256px)', value: 256 },
  { label: 'Large (512px) — Recommended for print', value: 512 },
  { label: 'XL (1024px) — High resolution', value: 1024 },
];

// ── Error correction options ──────────────────────────────────────────────────
const EC_OPTIONS = [
  { label: 'L — Low (7%)', value: 'L' },
  { label: 'M — Medium (15%)', value: 'M' },
  { label: 'Q — Quartile (25%)', value: 'Q' },
  { label: 'H — High (30%) — Best for logos', value: 'H' },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const PrintIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
  </svg>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function PrintableQRCode() {
  const navigate = useNavigate();

  const [qrUrl, setQrUrl]           = useState(DEFAULT_URL);
  const [inputUrl, setInputUrl]     = useState(DEFAULT_URL);
  const [size, setSize]             = useState(512);
  const [ecLevel, setEcLevel]       = useState('H');
  const [fgColor, setFgColor]       = useState('#1a0f3c');
  const [bgColor, setBgColor]       = useState('#ffffff');
  const [includeMargin, setIncludeMargin] = useState(true);

  const svgRef    = useRef(null);
  const canvasRef = useRef(null);

  function applyUrl() {
    if (!inputUrl.trim()) return;
    setQrUrl(inputUrl.trim());
  }

  // Filename based on current timestamp
  const baseFilename = `exhibition_qr_${new Date().toISOString().slice(0, 10)}`;

  return (
    <div className="animated-bg min-h-screen relative overflow-x-hidden">
      {/* Decorative orbs */}
      <div className="orb w-80 h-80 bg-brand-800 top-[-80px] left-[-60px]" />
      <div className="orb w-56 h-56 bg-purple-900 bottom-[-40px] right-[-40px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 no-print">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="btn-secondary flex items-center gap-1.5"
          >
            <BackIcon /> Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">QR Code Generator</h1>
            <p className="text-white/40 text-sm">Generate print-ready SVG/PNG for exhibition wall stickers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left: Settings Panel ── */}
          <div className="space-y-4 no-print">

            {/* URL Setting */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">
                Target URL
              </h2>
              <div className="flex gap-2">
                <input
                  id="qr-url-input"
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyUrl()}
                  className="form-input text-sm flex-1"
                  placeholder="https://yourdomain.com/q/exhibition"
                />
                <button
                  onClick={applyUrl}
                  className="px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-600 text-white text-sm font-semibold transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
              <p className="text-white/30 text-xs mt-2 leading-relaxed">
                ⚠️ This URL is embedded in the QR code. Only change it <em>before</em> printing new stickers.
              </p>
            </div>

            {/* Size Setting */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">
                Output Size
              </h2>
              <select
                id="qr-size-select"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="form-input text-sm bg-white/10"
              >
                {SIZE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#1a0f3c]">{o.label}</option>
                ))}
              </select>
            </div>

            {/* Error Correction */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">
                Error Correction Level
              </h2>
              <select
                id="qr-ec-select"
                value={ecLevel}
                onChange={(e) => setEcLevel(e.target.value)}
                className="form-input text-sm bg-white/10"
              >
                {EC_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#1a0f3c]">{o.label}</option>
                ))}
              </select>
              <p className="text-white/30 text-xs mt-2">
                Higher levels allow the QR to be scanned even when partially obscured.
              </p>
            </div>

            {/* Color Settings */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">
                Colors
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-2">Foreground</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
                    />
                    <span className="text-white/50 text-xs font-mono">{fgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
                    />
                    <span className="text-white/50 text-xs font-mono">{bgColor}</span>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMargin}
                  onChange={(e) => setIncludeMargin(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-500"
                />
                <span className="text-white/60 text-sm">Include quiet zone margin</span>
              </label>
            </div>

            {/* Download Buttons */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">
                Download / Export
              </h2>
              <div className="grid grid-cols-1 gap-2">
                <button
                  id="download-png-btn"
                  onClick={() => downloadAsPNG(canvasRef, `${baseFilename}.png`)}
                  className="btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <DownloadIcon /> Download PNG ({size}×{size}px)
                </button>
                <button
                  id="download-svg-btn"
                  onClick={() => downloadAsSVG(svgRef, `${baseFilename}.svg`)}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                             font-semibold text-white text-sm
                             bg-gradient-to-r from-indigo-700 to-purple-700
                             hover:from-indigo-600 hover:to-purple-600
                             transition-all shadow-lg"
                >
                  <DownloadIcon /> Download SVG (Vector)
                </button>
                <button
                  onClick={printQR}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                             font-semibold text-white text-sm
                             bg-gradient-to-r from-slate-700 to-slate-600
                             hover:from-slate-600 hover:to-slate-500
                             transition-all"
                >
                  <PrintIcon /> Print QR Code
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: QR Preview ── */}
          <div className="flex flex-col items-center">

            {/* Preview Card */}
            <div className="glass-card p-6 w-full flex flex-col items-center no-print">
              <h2 className="text-sm font-semibold text-white/80 mb-1 uppercase tracking-wider self-start">
                Live Preview
              </h2>
              <p className="text-white/30 text-xs mb-5 self-start">
                {qrUrl.length > 55 ? qrUrl.slice(0, 55) + '…' : qrUrl}
              </p>

              {/* SVG QR (for SVG download) */}
              <div
                ref={svgRef}
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: bgColor, padding: includeMargin ? 16 : 0 }}
              >
                <QRCodeSVG
                  value={qrUrl}
                  size={Math.min(size, 300)}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={ecLevel}
                  includeMargin={false}
                />
              </div>

              {/* Hidden Canvas QR (for PNG download at full resolution) */}
              <div ref={canvasRef} className="hidden">
                <QRCodeCanvas
                  value={qrUrl}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={ecLevel}
                  includeMargin={includeMargin}
                />
              </div>

              <div className="mt-5 w-full space-y-1 text-xs">
                <div className="flex justify-between text-white/30">
                  <span>Error Correction</span>
                  <span className="font-mono text-white/50">{ecLevel}</span>
                </div>
                <div className="flex justify-between text-white/30">
                  <span>Output Size</span>
                  <span className="font-mono text-white/50">{size}×{size}px</span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="glass-card p-4 w-full mt-4 no-print">
              <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
                📋 Print Guidelines
              </h3>
              <ul className="text-white/40 text-xs space-y-1.5 leading-relaxed">
                <li>• Use <strong className="text-white/60">512px or 1024px</strong> size for professional print quality</li>
                <li>• Use <strong className="text-white/60">SVG format</strong> for infinite-resolution scaling (recommended for large stickers)</li>
                <li>• Keep at least <strong className="text-white/60">15mm quiet zone</strong> around the QR on printed material</li>
                <li>• Set <strong className="text-white/60">Error Correction H</strong> if adding a logo overlay</li>
                <li>• Test the printed QR with multiple phones before mass-printing</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── Print-only layout ── */}
      <div className="print-only hidden fixed inset-0 flex items-center justify-center bg-white">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'Inter, sans-serif', color: '#1a0f3c', marginBottom: '8px' }}>
            Exhibition 2024
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
            Scan to register your visit
          </p>
          <div style={{ display: 'inline-block', padding: '16px', background: '#fff', borderRadius: '12px' }}>
            <QRCodeSVG
              value={qrUrl}
              size={400}
              fgColor={fgColor}
              bgColor={bgColor}
              level={ecLevel}
              includeMargin={true}
            />
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>{qrUrl}</p>
        </div>
      </div>
    </div>
  );
}
