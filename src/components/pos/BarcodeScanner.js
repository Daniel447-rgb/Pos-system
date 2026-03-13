import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let html5QrCode;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('barcode-reader');
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' }, // rear camera
          { fps: 10, qrbox: { width: 240, height: 120 } },
          (decodedText) => {
            // On successful scan
            onScan(decodedText);
            stopScanner();
          },
          () => {} // ignore scan errors
        );
        setScanning(true);
      } catch (err) {
        setError('Camera access denied or not available. Please allow camera permissions.');
      }
    }

    async function stopScanner() {
      try {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        }
      } catch {}
    }

    startScanner();

    return () => { stopScanner(); };
  }, [onScan]);

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '17px', margin: 0 }}>Scan Barcode</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Point camera at product barcode</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
        </div>

        {error ? (
          <div style={{ padding: '20px', background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '13px', color: 'var(--accent-rose)', margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Scanner viewfinder */}
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', position: 'relative' }}>
              <div id="barcode-reader" style={{ width: '100%' }} />
              {/* Scan line animation */}
              {scanning && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '2px', background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                  animation: 'scanLine 2s ease-in-out infinite',
                  zIndex: 10
                }} />
              )}
              {/* Corner guides */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
                const isTop = pos.includes('top');
                const isLeft = pos.includes('left');
                return (
                  <div key={pos} style={{
                    position: 'absolute',
                    top: isTop ? '20px' : 'auto', bottom: !isTop ? '20px' : 'auto',
                    left: isLeft ? '20px' : 'auto', right: !isLeft ? '20px' : 'auto',
                    width: '20px', height: '20px',
                    borderTop: isTop ? '2px solid #00d4ff' : 'none',
                    borderBottom: !isTop ? '2px solid #00d4ff' : 'none',
                    borderLeft: isLeft ? '2px solid #00d4ff' : 'none',
                    borderRight: !isLeft ? '2px solid #00d4ff' : 'none',
                    zIndex: 10
                  }} />
                );
              })}
            </div>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', margin: '14px 0 0', lineHeight: 1.5 }}>
          The barcode will be matched against product SKU codes. Make sure products have SKU set.
        </p>

        <button onClick={onClose} className="btn-secondary" style={{ width: '100%', marginTop: '14px' }}>
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 20%; }
          50% { top: 80%; }
          100% { top: 20%; }
        }
        #barcode-reader video { width: 100% !important; border-radius: 8px; }
        #barcode-reader canvas { display: none; }
      `}</style>
    </div>
  );
}
