"use client";

import { useState } from "react";

/** A row of bars for a short time series (e.g. signups per day). */
export function MiniBarChart({
  data,
  formatLabel,
}: {
  data: { date: string; count: number }[];
  formatLabel?: (date: string) => string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div>
      <div className="flex items-end gap-1 h-28">
        {data.map((d, i) => {
          const pct = Math.max(4, Math.round((d.count / max) * 100));
          const isHovered = hovered === i;
          return (
            <div
              key={d.date}
              className="flex-1 h-full flex items-end relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHovered ? (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-surface-3 border border-border px-1.5 py-0.5 text-[11px] whitespace-nowrap z-10">
                  {d.count} on {formatLabel ? formatLabel(d.date) : d.date}
                </div>
              ) : null}
              <div
                className={`w-full rounded-sm transition-colors ${
                  isHovered ? "bg-accent" : d.count > 0 ? "bg-accent/60" : "bg-surface-3"
                }`}
                style={{ height: `${pct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 text-[11px] text-ink-faint">
        <span>{formatLabel ? formatLabel(data[0]?.date ?? "") : data[0]?.date}</span>
        <span>{formatLabel ? formatLabel(data[data.length - 1]?.date ?? "") : data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

/** Horizontal bar list — used for category breakdowns and similar rankings. */
export function HorizontalBarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-ink">{item.label}</span>
            <span className="text-ink-faint">{item.value}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${Math.round((item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
