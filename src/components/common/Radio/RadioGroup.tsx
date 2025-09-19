"use client";
import React, { createContext, useContext, useId } from "react";
import { cn } from "@/utils/cn";

type Ctx<T extends string> = { name: string; value: T; onChange: (v: T) => void; disabled?: boolean };
const RadioCtx = createContext<Ctx<any> | null>(null);
const useRadioCtx = <T extends string>() => {
  const ctx = useContext(RadioCtx);
  if (!ctx) throw new Error("Radio components must be used within <RadioGroup>.");
  return ctx as Ctx<T>;
};

export type RadioGroupProps<T extends string> = {
  name?: string;
  value: T;
  onValueChange: (v: T) => void;
  className?: string;
  gapPx?: number;
  disabled?: boolean;
  options?: { value: T; label: string }[];
  children?: React.ReactNode;
};

export function RadioGroup<T extends string>({
  name,
  value,
  onValueChange,
  className,
  gapPx = 40,
  disabled,
  options,
  children,
}: RadioGroupProps<T>) {
  const uid = useId();
  const groupName = name ?? `${uid}-rg`;
  return (
    <RadioCtx.Provider value={{ name: groupName, value, onChange: onValueChange, disabled }}>
      <div
        className={cn("flex items-center flex-wrap text-[16px]", className)}
        style={{ columnGap: gapPx }}
        aria-disabled={disabled ? "true" : undefined}
      >
        {options ? options.map(opt => <Radio<T> key={opt.value} val={opt.value} label={opt.label} />) : children}
      </div>
    </RadioCtx.Provider>
  );
}

export function Radio<T extends string>({ val, label, className, disabled }: {
  val: T; label: React.ReactNode; className?: string; disabled?: boolean;
}) {
  const { name, value, onChange, disabled: groupDisabled } = useRadioCtx<T>();
  const id = `${name}-${val}`;
  const isDisabled = disabled ?? groupDisabled;
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <input
        id={id}
        type="radio"
        name={name}
        value={val}
        checked={value === val}
        onChange={() => onChange(val)}
        disabled={isDisabled}
        className="accent-[#256EF4] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#256EF4]/40"
      />
      <label htmlFor={id} className={cn("leading-none", isDisabled && "opacity-40 cursor-not-allowed")}>
        {label}
      </label>
    </div>
  );
}
