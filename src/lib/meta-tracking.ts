export type MetaEventName = "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase";
export type ConsentChoice = "accepted" | "rejected" | null;

type PixelConfig = { key: string; id: string; enabled: boolean; events: Set<MetaEventName> };
type SafeParams = Record<string, string | number | boolean>;
type TrackOptions = { eventId?: string };
type Fbq = ((...args: unknown[]) => void) & { queue: unknown[][]; callMethod?: (...args: unknown[]) => void; push: (...args: unknown[]) => void; loaded?: boolean; version: string };
type FbqWindow = Window & { fbq?: Fbq; _fbq?: Fbq };

export const CONSENT_STORAGE_KEY = "bf_optional_measurement_consent";
const CONSENT_EVENT = "bf:consent-change";
const ALLOWED_EVENTS = new Set<MetaEventName>(["PageView", "ViewContent", "InitiateCheckout", "Purchase"]);
const SAFE_CONTENT_NAMES = new Set(["quiz_informativo", "resumo_informativo"]);
const SAFE_CONTENT_CATEGORIES = new Set(["informacao_publica"]);
const initializedPixelIds = new Set<string>();
const sentEvents = new Map<string, number>();
let loaderStarted = false;
let lastRouteTracked: string | null = null;
let transientConsent: ConsentChoice = null;

function parseEvents(raw: string | undefined): Set<MetaEventName> {
  return new Set((raw ?? "").split(",").map((value) => value.trim()).filter((value): value is MetaEventName => ALLOWED_EVENTS.has(value as MetaEventName)));
}

function isEnabled(raw: string | undefined): boolean {
  return raw?.trim().toLowerCase() === "true";
}

export function getPixelConfigurations(): PixelConfig[] {
  return [
    { key: "VENDAS02_A", id: process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_A ?? "", enabled: isEnabled(process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_A_ENABLED), events: parseEvents(process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_A_EVENTS) },
    { key: "VENDAS01", id: process.env.NEXT_PUBLIC_META_PIXEL_VENDAS01 ?? "", enabled: isEnabled(process.env.NEXT_PUBLIC_META_PIXEL_VENDAS01_ENABLED), events: parseEvents(process.env.NEXT_PUBLIC_META_PIXEL_VENDAS01_EVENTS) },
    { key: "VENDAS02_B", id: process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_B ?? "", enabled: isEnabled(process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_B_ENABLED), events: parseEvents(process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_B_EVENTS) },
    { key: "VENDAS03", id: process.env.NEXT_PUBLIC_META_PIXEL_VENDAS03 ?? "", enabled: isEnabled(process.env.NEXT_PUBLIC_META_PIXEL_VENDAS03_ENABLED), events: parseEvents(process.env.NEXT_PUBLIC_META_PIXEL_VENDAS03_EVENTS) },
  ].filter((pixel) => /^\d{6,20}$/.test(pixel.id));
}

export function getConsentChoice(): ConsentChoice {
  if (typeof window === "undefined") return null;
  try {
    const choice = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (choice === "accepted" || choice === "rejected") return choice;
  } catch {
    return transientConsent;
  }
  return transientConsent;
}

export function setConsentChoice(choice: Exclude<ConsentChoice, null>): void {
  transientConsent = choice;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Consentimento temporário funciona nesta sessão; pixels continuam sem inicializar se houver recusa.
  }
  const fbq = (window as FbqWindow).fbq;
  if (choice === "rejected" && fbq) fbq("consent", "revoke");
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

export function consentEventName(): string {
  return CONSENT_EVENT;
}

function hasGrantedConsent(): boolean {
  return getConsentChoice() === "accepted";
}

function loadMetaLibrary(): Fbq | null {
  if (typeof window === "undefined") return null;
  const w = window as FbqWindow;
  if (w.fbq) return w.fbq;

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.queue = [];
  fbq.push = fbq;
  fbq.version = "2.0";
  w.fbq = fbq;
  w._fbq = fbq;

  if (!loaderStarted) {
    loaderStarted = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.dataset.optionalMarketing = "true";
    document.head.appendChild(script);
  }
  return fbq;
}

export function initializeAuthorizedPixels(): void {
  if (!hasGrantedConsent()) return;
  const configured = getPixelConfigurations().filter((pixel) => pixel.enabled && pixel.events.size > 0);
  if (!configured.length) return;
  const fbq = loadMetaLibrary();
  if (!fbq) return;
  fbq("consent", "grant");
  for (const pixel of configured) {
    if (initializedPixelIds.has(pixel.id)) continue;
    fbq("init", pixel.id);
    initializedPixelIds.add(pixel.id);
  }
}

export function sanitizeMetaParameters(parameters: SafeParams): SafeParams {
  const safe: SafeParams = {};
  if (typeof parameters.content_name === "string" && SAFE_CONTENT_NAMES.has(parameters.content_name)) safe.content_name = parameters.content_name;
  if (typeof parameters.content_category === "string" && SAFE_CONTENT_CATEGORIES.has(parameters.content_category)) safe.content_category = parameters.content_category;
  if (parameters.content_type === "product" || parameters.content_type === "quiz" || parameters.content_type === "information") safe.content_type = parameters.content_type;
  if (parameters.currency === "BRL") safe.currency = "BRL";
  if (typeof parameters.value === "number" && Number.isFinite(parameters.value) && parameters.value >= 0) safe.value = parameters.value;
  if (typeof parameters.num_items === "number" && Number.isInteger(parameters.num_items) && parameters.num_items >= 0 && parameters.num_items <= 999) safe.num_items = parameters.num_items;
  return safe;
}

function uniqueEventId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Único ponto de envio ao Meta. Só aceita parâmetros não pessoais e Pixels
 * individualmente habilitados, depois do consentimento explícito.
 */
export function trackMetaEvent(eventName: MetaEventName, parameters: SafeParams = {}, options: TrackOptions = {}): string | null {
  if (!ALLOWED_EVENTS.has(eventName) || !hasGrantedConsent()) return null;
  // Purchase permanece bloqueado nesta versão: não há checkout nem confirmação de pagamento no backend.
  if (eventName === "Purchase") return null;

  const suppliedEventId = options.eventId;
  const eventId = suppliedEventId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(suppliedEventId)
    ? suppliedEventId
    : uniqueEventId();
  initializeAuthorizedPixels();
  const fbq = (window as FbqWindow).fbq;
  if (!fbq) return null;

  const payload = sanitizeMetaParameters(parameters);
  const now = Date.now();
  for (const [key, createdAt] of sentEvents) if (now - createdAt > 48 * 60 * 60 * 1000) sentEvents.delete(key);

  for (const pixel of getPixelConfigurations()) {
    if (!pixel.enabled || !pixel.events.has(eventName)) continue;
    const dedupeKey = `${pixel.id}:${eventName}:${eventId}`;
    if (sentEvents.has(dedupeKey)) continue;
    sentEvents.set(dedupeKey, now);
    fbq("trackSingle", pixel.id, eventName, payload, { eventID: eventId });
  }
  return eventId;
}

export function trackRouteView(path: string): void {
  if (!hasGrantedConsent() || lastRouteTracked === path) return;
  lastRouteTracked = path;
  trackMetaEvent("PageView", {});
  if (path === "/quiz") trackMetaEvent("ViewContent", { content_name: "quiz_informativo", content_category: "informacao_publica" });
  if (path === "/resultado") trackMetaEvent("ViewContent", { content_name: "resumo_informativo", content_category: "informacao_publica" });
}
