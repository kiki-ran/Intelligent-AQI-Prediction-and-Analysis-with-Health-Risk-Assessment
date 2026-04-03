// Correlation Heatmap — rendered as an HTML grid with color interpolation
import { useState } from 'react'

function heatColor(val) {
  // val is -1 to 1; map to red-white-green or blue scale
  const v = Math.max(-1, Math.min(1, val))
  if (v >= 0) {
    // 0→white, 1→green
    const r = Math.round(255 * (1 - v))
    const g = Math.round(200 + 55 * v)
    const b = Math.round(150 * (1 - v))
    return `rgb(${r},${g},${b})`
  } else {
    // 0→white, -1→red
    const abs = Math.abs(v)
    const r = Math.round(200 + 55 * abs)
    const g = Math.round(255 * (1 - abs))
    const b = Math.round(255 * (1 - abs))
    return `rgb(${r},${g},${b})`
  }
}

function textColor(val) {
  return Math.abs(val) > 0.4 ? '#000' : '#6b7280'
}

export default function CorrelationHeatmap({ labels = [], matrix = [] }) {
  const [tooltip, setTooltip] = useState(null)

  if (!labels.length || !matrix.length) {
    return <div style={{ color: '#4a5578', padding: 20, textAlign: 'center' }}>Loading heatmap…</div>
  }

  return (
    <div className="heatmap-wrap">
      {tooltip && (
        <div style={{
          position: 'fixed', top: tooltip.y - 48, left: tooltip.x + 12,
          background: '#131929', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '6px 12px', fontSize: 12, pointerEvents: 'none',
          color: '#f0f4ff', zIndex: 100, whiteSpace: 'nowrap',
        }}>
          {tooltip.row} × {tooltip.col}: <strong>{tooltip.val.toFixed(3)}</strong>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
        {/* Y-axis labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4 }}>
          {labels.map((l, i) => (
            <div key={i} style={{
              height: 42, display: 'flex', alignItems: 'center',
              justifyContent: 'flex-end', fontSize: 10, color: '#4a5578',
              whiteSpace: 'nowrap', paddingRight: 6, minWidth: 70,
            }}>{l}</div>
          ))}
        </div>

        <div>
          {/* X-axis labels */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 4, paddingLeft: 2 }}>
            {labels.map((l, i) => (
              <div key={i} style={{
                width: 42, fontSize: 9, color: '#4a5578', textAlign: 'center',
                writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                height: 52, overflow: 'hidden'
              }}>{l}</div>
            ))}
          </div>

          {/* Grid */}
          {matrix.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
              {row.map((val, ci) => (
                <div
                  key={ci}
                  style={{
                    width: 42, height: 42, borderRadius: 5,
                    background: heatColor(val),
                    fontSize: 9, color: textColor(val),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, cursor: 'default', transition: 'transform 150ms',
                  }}
                  onMouseEnter={(e) => setTooltip({
                    x: e.clientX, y: e.clientY,
                    row: labels[ri], col: labels[ci], val,
                  })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {val.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
