// src/app/admin/events/register/components/parts/Segmented.tsx
"use client";
import React from "react";

export default function Segmented({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-full bg-neutral-100 p-1 ring-1 ring-black/10">
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            type="button"
            key={it.value}
            onClick={() => onChange(it.value)}
            className={
              "px-3 h-8 rounded-full text-sm font-medium transition " +
              (active
                ? "bg-white shadow ring-1 ring-black/10 text-neutral-900"
                : "text-neutral-500 hover:text-neutral-800")
            }
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
