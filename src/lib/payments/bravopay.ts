import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_BASE_URL = "https://bravopay.club/api/v1";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 256_000;
const MAX_WEBHOOK_BYTES = 256_000;
const WEBHOOK_TOLERANCE_SECONDS = 300;

export type SupportedPaymentStatus =
  | "pending"
  | "paid"
  | "expired"
  | "refunded"
  | "chargeback"
  | "failed"
  | "unknown";

export type BravopayConfig = {
  enabled: true;
  apiKey: string;
  webhookSecret: string;
  baseUrl: string;
  amountCents: number;
  description: string;
  productId?: string;
};

export type BravopayConfigResult =
  | { ok: true; config: BravopayConfig }
  | { ok: false; reason: "feature_disabled" | "missing_configuration" | "invalid_configuration" };

export type PixCustomer = {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
};

export type NormalizedPix = {
  /** Optional QR payload (the create example omits it; another official example includes pix.qr_code). */
  qrCode: string | null;
  /** PIX BR Code string suitable for copy/paste. */
  copyPaste: string | null;
  expiresAt: string | null;
};

export type BravopayTransaction = {
  id: string;
  status: SupportedPaymentStatus;
  amountCents: number;
  externalReference: string | null;
  pix: NormalizedPix;
};

export type CreatePixInput = {
  /** Stable internal order reference; must not contain customer personal information. */
  externalReference: string;
  /** Stable per-order idempotency key. */
  idempotencyKey: string;
  /** Optional only if the business flow already has these fields; never logged by this module. */
  customer?: PixCustomer;
};

export type NormalizedWebhook = {
  eventId: string;
  type: string;
  created: number | null;
  transactionId: string | null;
  status: SupportedPaymentStatus;
  amountCents: number | null;
  externalReference: string | null;
  payloadHash: string;
};

export type WebhookResult =
  | { ok: true; event: NormalizedWebhook }
  | { ok: false; reason: "missing_secret" | "invalid_signature" | "expired_signature" | "invalid_payload" };

/** Pure helper for callers that persist event IDs with a unique constraint. */
export function isDuplicateWebhookEvent(
  event: Pick<NormalizedWebhook, "eventId">,
  knownEventIds: ReadonlySet<string>
): boolean {
  return knownEventIds.has(event.eventId);
}

export class BravopayError extends Error {
  constructor(
    message: string,
    readonly code: "feature_disabled" | "missing_configuration" | "invalid_configuration" | "invalid_input" | "request_failed" | "response_too_large" | "invalid_response"
  ) {
    super(message);
    this.name = "BravopayError";
  }
}

/**
 * CHECKOUT_ENABLED precisa ser exatamente "true". Nenhum segredo ou preço é
 * exportado ao cliente; o preço sempre vem de PAYMENT_SERVICE_PRICE_CENTS.
 */
export function getBravopayConfig(env: NodeJS.ProcessEnv = process.env): BravopayConfigResult {
  if (env.CHECKOUT_ENABLED !== "true") return { ok: false, reason: "feature_disabled" };

  const apiKey = env.BRAVOPAY_API_KEY?.trim();
  const webhookSecret = env.BRAVOPAY_WEBHOOK_SECRET?.trim();
  const priceText = env.PAYMENT_SERVICE_PRICE_CENTS?.trim();
  const serviceDescription = (env.PAYMENT_SERVICE_DESCRIPTION ?? env.PAYMENT_SERVICE_NAME)?.trim();
  const baseUrl = (env.BRAVOPAY_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const productId = env.BRAVOPAY_PRODUCT_ID?.trim();

  if (!apiKey || !webhookSecret || !priceText || !serviceDescription) {
    return { ok: false, reason: "missing_configuration" };
  }
  if (!/^\d+$/.test(priceText) || !Number.isSafeInteger(Number(priceText)) || Number(priceText) < 500) {
    return { ok: false, reason: "invalid_configuration" };
  }
  try {
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash) {
      return { ok: false, reason: "invalid_configuration" };
    }
  } catch {
    return { ok: false, reason: "invalid_configuration" };
  }
  if (serviceDescription.length > 300 || (productId && productId.length > 200)) {
    return { ok: false, reason: "invalid_configuration" };
  }

  return {
    ok: true,
    config: {
      enabled: true,
      apiKey,
      webhookSecret,
      baseUrl,
      amountCents: Number(priceText),
      description: serviceDescription,
      ...(productId ? { productId } : {}),
    },
  };
}

function configOrThrow(): BravopayConfig {
  const result = getBravopayConfig();
  if (!result.ok) {
    if (result.reason === "feature_disabled") {
      throw new BravopayError("Checkout desabilitado", "feature_disabled");
    }
    throw new BravopayError("Configuração de pagamento ausente ou inválida", result.reason);
  }
  return result.config;
}

function boundedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 && cleaned.length <= maxLength ? cleaned : null;
}

function normalizeCustomer(customer: PixCustomer | undefined): Record<string, string> | undefined {
  if (customer === undefined) return undefined;
  if (!customer || typeof customer !== "object" || Array.isArray(customer)) {
    throw new BravopayError("Dados de cliente inválidos", "invalid_input");
  }
  const result: Record<string, string> = {};
  for (const field of ["name", "email", "cpf", "phone"] as const) {
    const value = customer[field];
    if (value === undefined) continue;
    const cleaned = boundedString(value, field === "email" ? 254 : 200);
    if (!cleaned) throw new BravopayError("Dados de cliente inválidos", "invalid_input");
    result[field] = cleaned;
  }
  return Object.keys(result).length ? result : undefined;
}

function validateCreateInput(input: CreatePixInput): { externalReference: string; idempotencyKey: string; customer?: Record<string, string> } {
  if (!input || typeof input !== "object") throw new BravopayError("Parâmetros inválidos", "invalid_input");
  const externalReference = boundedString(input.externalReference, 120);
  const idempotencyKey = boundedString(input.idempotencyKey, 200);
  if (!externalReference || !idempotencyKey) {
    throw new BravopayError("Referência do pedido e chave de idempotência são obrigatórias", "invalid_input");
  }
  const customer = normalizeCustomer(input.customer);
  return { externalReference, idempotencyKey, ...(customer ? { customer } : {}) };
}

/**
 * Normaliza somente os campos snake_case efetivamente exemplificados pela
 * documentação. O exemplo de criação contém copy_paste/expires_at; um exemplo
 * de listagem também contém qr_code. O QR é opcional e nunca inferido de outro
 * campo: versões/esquemas divergem, portanto payloads ausentes ou inválidos
 * viram null em vez de interromper a leitura do código copia-e-cola.
 */
export function normalizePix(value: unknown): NormalizedPix {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { qrCode: null, copyPaste: null, expiresAt: null };
  }
  const pix = value as Record<string, unknown>;
  return {
    qrCode: boundedString(pix.qr_code, 200_000),
    copyPaste: boundedString(pix.copy_paste, 20_000),
    expiresAt: boundedString(pix.expires_at, 100),
  };
}

/** Maps only documented transaction statuses; FAILED is supported only via its documented event type. */
export function interpretStatus(value: unknown): SupportedPaymentStatus {
  if (typeof value !== "string") return "unknown";
  switch (value.trim().toUpperCase()) {
    case "PENDING": return "pending";
    case "PAID": return "paid";
    case "EXPIRED": return "expired";
    case "REFUNDED": return "refunded";
    case "CHARGEBACK": return "chargeback";
    default: return "unknown";
  }
}

function statusFromWebhookType(type: string): SupportedPaymentStatus {
  switch (type) {
    case "transaction.created": return "pending";
    case "transaction.paid": return "paid";
    case "transaction.refunded": return "refunded";
    case "transaction.chargeback": return "chargeback";
    case "transaction.expired": return "expired";
    case "transaction.failed": return "failed";
    // Não inferir status financeiro de tipos de evento não reconhecidos
    // (por exemplo, withdrawal.* ou novos eventos do provedor).
    default: return "unknown";
  }
}

async function readBoundedResponse(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new BravopayError("Resposta do provedor excede o limite", "response_too_large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

/** Creates a PIX payment using only server-configured price and service text. */
export async function createPixTransaction(input: CreatePixInput): Promise<BravopayTransaction> {
  // Gate checked first: when disabled this function cannot reach fetch, even if
  // the caller provides plausible input or credentials are otherwise present.
  const config = configOrThrow();
  const validated = validateCreateInput(input);
  const body = {
    amount_cents: config.amountCents,
    method: "pix",
    description: config.description,
    external_reference: validated.externalReference,
    ...(config.productId ? { product_id: config.productId } : {}),
    ...(validated.customer ? { customer: validated.customer } : {}),
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${config.baseUrl}/transactions`, {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Idempotency-Key": validated.idempotencyKey,
      },
      body: JSON.stringify(body),
    });
    const responseText = await readBoundedResponse(response, MAX_RESPONSE_BYTES);
    if (!response.ok) throw new BravopayError("Falha ao criar transação no provedor", "request_failed");

    let raw: unknown;
    try {
      raw = JSON.parse(responseText);
    } catch {
      throw new BravopayError("Resposta inválida do provedor", "invalid_response");
    }
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new BravopayError("Resposta inválida do provedor", "invalid_response");
    }
    const data = raw as Record<string, unknown>;
    const id = boundedString(data.id, 200);
    if (!id || !Number.isSafeInteger(data.amount_cents) || data.amount_cents !== config.amountCents) {
      throw new BravopayError("Resposta inválida do provedor", "invalid_response");
    }
    return {
      id,
      status: interpretStatus(data.status),
      amountCents: data.amount_cents as number,
      externalReference: boundedString(data.external_reference, 120),
      pix: normalizePix(data.pix),
    };
  } catch (error) {
    if (error instanceof BravopayError) throw error;
    // Do not forward arbitrary network exceptions that might contain URL/header data.
    throw new BravopayError("Não foi possível concluir a solicitação ao provedor", "request_failed");
  } finally {
    clearTimeout(timeout);
  }
}

function getSignatureHeader(headers: Headers): string | null {
  const canonical = headers.get("bravopay-signature");
  const alias = headers.get("x-bravopay-signature");
  if (canonical && alias && canonical.trim() !== alias.trim()) return null;
  return canonical ?? alias;
}

/** Verify `t=<unix>,v1=<hex>` over the exact UTF-8 raw body, with constant-time comparison. */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
  toleranceSeconds = WEBHOOK_TOLERANCE_SECONDS,
  nowMs = Date.now()
): boolean {
  if (!signatureHeader || !secret || !Number.isSafeInteger(toleranceSeconds) || toleranceSeconds < 0) return false;
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BYTES) return false;
  const parts = new Map<string, string>();
  for (const field of signatureHeader.split(",")) {
    const match = /^\s*(t|v1)\s*=\s*([^,]+)\s*$/.exec(field);
    if (!match || parts.has(match[1])) return false;
    parts.set(match[1], match[2]);
  }
  const timestamp = parts.get("t");
  const suppliedHex = parts.get("v1");
  if (!timestamp || !/^[0-9]+$/.test(timestamp) || !suppliedHex || !/^[a-fA-F0-9]{64}$/.test(suppliedHex)) return false;
  const timestampNumber = Number(timestamp);
  if (!Number.isSafeInteger(timestampNumber) || timestampNumber <= 0 || !Number.isFinite(nowMs)) return false;
  if (Math.abs(nowMs / 1000 - timestampNumber) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest();
  const supplied = Buffer.from(suppliedHex, "hex");
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

/**
 * Authenticates and minimally normalizes an event. No persistence/deduplication
 * is attempted here: use the stable eventId as a unique key in durable storage.
 * Personal fields and the raw event body are intentionally not returned.
 */
export function parseBravopayWebhook(
  rawBody: string,
  headers: Headers,
  env: Record<string, string | undefined> = process.env,
  nowMs = Date.now()
): WebhookResult {
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BYTES) return { ok: false, reason: "invalid_payload" };
  const secret = env.BRAVOPAY_WEBHOOK_SECRET?.trim();
  if (!secret) return { ok: false, reason: "missing_secret" };
  const signature = getSignatureHeader(headers);
  if (!signature) return { ok: false, reason: "invalid_signature" };
  const timestampField = signature.split(",").find((part) => /^\s*t\s*=/.test(part));
  const timestamp = timestampField?.slice(timestampField.indexOf("=") + 1).trim();
  if (timestamp && /^[0-9]+$/.test(timestamp) && Number.isSafeInteger(Number(timestamp)) && Math.abs(nowMs / 1000 - Number(timestamp)) > WEBHOOK_TOLERANCE_SECONDS) {
    return { ok: false, reason: "expired_signature" };
  }
  if (!verifyWebhookSignature(rawBody, signature, secret, WEBHOOK_TOLERANCE_SECONDS, nowMs)) {
    return { ok: false, reason: "invalid_signature" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { ok: false, reason: "invalid_payload" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { ok: false, reason: "invalid_payload" };
  const envelope = parsed as Record<string, unknown>;
  const eventId = boundedString(envelope.id, 200);
  const type = boundedString(envelope.type, 100);
  const data = envelope.data;
  if (!eventId || !type || !data || typeof data !== "object" || Array.isArray(data)) return { ok: false, reason: "invalid_payload" };
  const transaction = data as Record<string, unknown>;
  const amountCents = transaction.amount_cents;
  if (amountCents !== undefined && (!Number.isSafeInteger(amountCents) || (amountCents as number) < 0)) {
    return { ok: false, reason: "invalid_payload" };
  }
  const created = envelope.created;
  if (created !== undefined && (!Number.isSafeInteger(created) || (created as number) <= 0)) {
    return { ok: false, reason: "invalid_payload" };
  }
  return {
    ok: true,
    event: {
      eventId,
      type,
      created: typeof created === "number" ? created : null,
      transactionId: boundedString(transaction.id, 200),
      status: statusFromWebhookType(type),
      amountCents: typeof amountCents === "number" ? amountCents : null,
      externalReference: boundedString(transaction.external_reference, 120),
      payloadHash: createHash("sha256").update(rawBody, "utf8").digest("hex"),
    },
  };
}
