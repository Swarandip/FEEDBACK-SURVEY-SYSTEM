import React from 'react';

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Distinct colors for rating 1–5 (low → high). */
export const RATING_PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#2563eb'];

/** SVG pie slice from center (cx,cy) with radius r, angles in degrees clockwise from top (0° = 12 o'clock). */
function pieSlicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const sweep = endAngle - startAngle;
  if (sweep >= 359.99) {
    return null; // caller renders <circle> instead
  }
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

const FALLBACK_PIE_COLORS = ['#a855f7', '#ec4899', '#06b6d4', '#84cc16', '#f59e0b'];

export const PieChart: React.FC<{
  data: Array<{ label: string; value: number; color?: string }>;
  /** Logical box size for viewBox (stroke fits inside with padding). */
  size?: number;
}> = ({ data, size = 200 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const pad = 6;
  const vb = size + pad * 2;
  const cx = vb / 2;
  const cy = vb / 2;
  const r = (size * 0.36);

  if (total === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-6">No data to display for this chart.</div>
    );
  }

  let angle = 0;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return {
      ...d,
      start,
      end,
      sweep,
      color: d.color ?? FALLBACK_PIE_COLORS[i % FALLBACK_PIE_COLORS.length]
    };
  });

  const drawable = slices.filter((s) => s.value > 0 && s.sweep > 0.08);
  const fullDisk = drawable.length === 1 && drawable[0].sweep >= 359.9;

  return (
    <div className="w-full min-w-0 flex flex-col items-stretch gap-4">
      <div className="mx-auto aspect-square w-full max-w-[200px] shrink-0">
        <svg
          viewBox={`0 0 ${vb} ${vb}`}
          className="h-full w-full block overflow-visible drop-shadow-sm"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {fullDisk ? (
            <circle cx={cx} cy={cy} r={r} fill={drawable[0].color} stroke="#fff" strokeWidth={2} />
          ) : (
            drawable.map((s) => {
              const dPath = pieSlicePath(cx, cy, r, s.start, s.end);
              if (!dPath) return null;
              return (
                <path
                  key={s.label}
                  d={dPath}
                  fill={s.color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            })
          )}
        </svg>
      </div>

      <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-2 text-xs text-gray-700 sm:grid-cols-2">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          const color = d.color ?? FALLBACK_PIE_COLORS[i % FALLBACK_PIE_COLORS.length];
          return (
            <li
              key={d.label}
              className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-gray-100 bg-gray-50/80 px-2.5 py-1.5"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm ring-1 ring-black/10"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-gray-800">{d.label}</span>
              </span>
              <span className="shrink-0 whitespace-nowrap tabular-nums text-gray-600">
                {d.value}
                <span className="text-gray-400"> ({pct}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const BarChart: React.FC<{
  data: Array<{ label: string; value: number; colorClassName?: string }>;
  height?: number;
}> = ({ data, height = 64 }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d) => {
          const h = clamp((d.value / max) * height, 2, height);
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center justify-end">
              <div
                className={`w-full rounded-t-md ${d.colorClassName || 'bg-blue-500'}`}
                style={{ height: h }}
                title={`${d.label}: ${d.value}`}
              />
              <div className="mt-1 text-[10px] text-gray-500 truncate w-full text-center">{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DonutChart: React.FC<{
  value: number; // 0..1
  label: string;
  sublabel?: string;
}> = ({ value, label, sublabel }) => {
  const v = clamp(value, 0, 1);
  const size = 84;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * v;
  const gap = c - dash;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-gray-200"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-purple-600"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-gray-900 text-sm font-semibold"
        >
          {Math.round(v * 100)}%
        </text>
      </svg>
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {sublabel ? <div className="text-xs text-gray-500">{sublabel}</div> : null}
      </div>
    </div>
  );
};

