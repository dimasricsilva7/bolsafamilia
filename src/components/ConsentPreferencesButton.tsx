"use client";

export function ConsentPreferencesButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("bf:open-consent"))} className={className}>
      Preferências de medição
    </button>
  );
}
