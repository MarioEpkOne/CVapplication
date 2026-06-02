"use client";

import { cn } from "@/lib/utils";
import { PRESETS, PROMPT_MAX_CHARS } from "@/lib/agent-events";

interface PromptInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onPreset: (prompt: string) => void;
  disabled: boolean;
}

export function PromptInput({ value, onChange, onSubmit, onPreset, disabled }: PromptInputProps) {
  const canSubmit = !disabled && value.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={disabled}
            onClick={() => onPreset(preset.prompt)}
            className={cn(
              "rounded-full border border-brand-300 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-800",
              disabled &&
                "cursor-not-allowed opacity-50 hover:bg-transparent dark:hover:bg-transparent",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && canSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        maxLength={PROMPT_MAX_CHARS}
        disabled={disabled}
        rows={3}
        placeholder="e.g. Check the current EUR/USD price and open a small long if risk allows"
        className="w-full resize-y rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-100"
        aria-label="Agent prompt"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-brand-400">
          {value.length}/{PROMPT_MAX_CHARS}
        </span>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
            canSubmit
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "cursor-not-allowed bg-brand-200 text-brand-400 dark:bg-brand-800 dark:text-brand-600",
          )}
        >
          {disabled ? "Running…" : "Run agent"}
        </button>
      </div>
    </div>
  );
}
