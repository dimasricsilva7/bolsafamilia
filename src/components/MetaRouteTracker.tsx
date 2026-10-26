"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { consentEventName, getConsentChoice, trackRouteView, type ConsentChoice } from "@/lib/meta-tracking";

function subscribeConsent(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(consentEventName(), callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(consentEventName(), callback);
    window.removeEventListener("storage", callback);
  };
}

export function MetaRouteTracker() {
  const pathname = usePathname();
  const consent = useSyncExternalStore<ConsentChoice>(subscribeConsent, getConsentChoice, () => null);

  useEffect(() => {
    if (consent === "accepted" && pathname) trackRouteView(pathname);
  }, [consent, pathname]);

  return null;
}
