import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import {
  BravopayError,
  createPixTransaction,
  getBravopayConfig,
  interpretStatus,
  isDuplicateWebhookEvent,
  normalizePix,
  parseBravopayWebhook,
  verifyWebhookSignature,
} from "./bravopay";

const ENV_NAMES = [
  "CHECKOUT_ENABLED",
  "BRAVOPAY_API_KEY",
  "BRAVOPAY_WEBHOOK_SECRET",
  "BRAVOPAY_BASE_URL",
  "BRAVOPAY_PRODUCT_ID",
  "PAYMENT_SERVICE_NAME",
  "PAYMENT_SERVICE_DESCRIPTION",
  "PAYMENT_SERVICE_PRICE_CENTS",
] as const;
const originalEnv = new Map(ENV_NAMES.map((name) => [name, process.env[name]]));

function setEnabledConfig() {
  process.env.CHECKOUT_ENABLED = "true";
  process.env.BRAVOPAY_API_KEY = "server-secret-test-only";
  process.env.BRAVOPAY_WEBHOOK_SECRET = "whsec-test-only";
  process.env.BRAVOPAY_BASE_URL = "https://bravopay.example.test/api/v1";
  process.env.PAYMENT_SERVICE_NAME = "Serviço demonstrativo";
  process.env.PAYMENT_SERVICE_PRICE_CENTS = "2590";
  delete process.env.PAYMENT_SERVICE_DESCRIPTION;
  delete process.env.BRAVOPAY_PRODUCT_ID;
}

function signatureFor(rawBody: string, secret: string, timestamp: number) {
  const digest = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest("hex");
  return `t=${timestamp},v1=${digest}`;
}

beforeEach(() => {
  setEnabledConfig();
});

afterEach(() => {
  vi.unstubAllGlobals();
  for (const name of ENV_NAMES) {
    const value = originalEnv.get(name);
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("BravoPay: configuração e criação PIX", () => {
  it.each([undefined, "false", "TRUE", "1", ""])("mantém o gate fechado para CHECKOUT_ENABLED=%s", async (value) => {
    if (value === undefined) delete process.env.CHECKOUT_ENABLED;
    else process.env.CHECKOUT_ENABLED = value;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(getBravopayConfig().ok).toBe(false);
    await expect(createPixTransaction({ externalReference: "order-1", idempotencyKey: "idem-1" }))
      .rejects.toMatchObject({ code: "feature_disabled" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("usa exclusivamente preço/serviço server-side e envia POST, Bearer e idempotency key", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      void _input;
      void init;
      return new Response(JSON.stringify({
        id: "tx_123",
        status: "PENDING",
        amount_cents: 2590,
        external_reference: "order-42",
        pix: { copy_paste: "000201BR.CODE", expires_at: "2026-10-29T00:00:00.000Z" },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const transaction = await createPixTransaction({
      externalReference: "order-42",
      idempotencyKey: "order-42-attempt-1",
      customer: { email: "buyer@example.test" },
      // Campo malicioso extra simula um preço enviado pelo navegador; não faz parte da API aceita.
      ...({ amountCents: 1, description: "texto cliente" } as unknown as object),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://bravopay.example.test/api/v1/transactions");
    expect(init?.method).toBe("POST");
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer server-secret-test-only");
    expect(headers.get("Idempotency-Key")).toBe("order-42-attempt-1");
    expect(JSON.parse(String(init?.body))).toEqual({
      amount_cents: 2590,
      method: "pix",
      description: "Serviço demonstrativo",
      external_reference: "order-42",
      customer: { email: "buyer@example.test" },
    });
    expect(transaction).toMatchObject({
      id: "tx_123",
      status: "pending",
      amountCents: 2590,
      externalReference: "order-42",
      pix: { copyPaste: "000201BR.CODE", qrCode: null },
    });
    expect(JSON.stringify(transaction)).not.toContain("server-secret-test-only");
  });

  it("falha fechado sem preço, serviço ou credenciais e não usa preço padrão", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    delete process.env.PAYMENT_SERVICE_PRICE_CENTS;
    expect(getBravopayConfig()).toMatchObject({ ok: false, reason: "missing_configuration" });
    await expect(createPixTransaction({ externalReference: "o1", idempotencyKey: "i1" }))
      .rejects.toMatchObject({ code: "missing_configuration" });
    process.env.PAYMENT_SERVICE_PRICE_CENTS = "500";
    delete process.env.PAYMENT_SERVICE_NAME;
    delete process.env.PAYMENT_SERVICE_DESCRIPTION;
    expect(getBravopayConfig()).toMatchObject({ ok: false, reason: "missing_configuration" });
    process.env.PAYMENT_SERVICE_NAME = "serviço";
    delete process.env.BRAVOPAY_API_KEY;
    expect(getBravopayConfig()).toMatchObject({ ok: false, reason: "missing_configuration" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("exige referência e idempotency key e não aceita preço abaixo do mínimo documentado", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(createPixTransaction({ externalReference: "", idempotencyKey: "i1" }))
      .rejects.toMatchObject({ code: "invalid_input" });
    process.env.PAYMENT_SERVICE_PRICE_CENTS = "499";
    expect(getBravopayConfig()).toMatchObject({ ok: false, reason: "invalid_configuration" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("não inclui conteúdo de erro do provedor (nem token) na mensagem de exceção", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      error: { message: "server-secret-test-only PII customer@example.test" },
    }), { status: 401 })));
    let caught: unknown;
    try {
      await createPixTransaction({ externalReference: "order-1", idempotencyKey: "idem-1" });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(BravopayError);
    expect((caught as Error).message).not.toContain("server-secret-test-only");
    expect((caught as Error).message).not.toContain("customer@example.test");
  });

  it("rejeita resposta acima do limite sem expor seu conteúdo", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("x".repeat(256_001), { status: 200 })));
    await expect(createPixTransaction({ externalReference: "order-1", idempotencyKey: "idem-1" }))
      .rejects.toMatchObject({ code: "response_too_large" });
  });
});

describe("BravoPay: status e normalização Pix", () => {
  it.each([
    ["PENDING", "pending"],
    ["paid", "paid"],
    ["EXPIRED", "expired"],
    ["REFUNDED", "refunded"],
    ["CHARGEBACK", "chargeback"],
    ["FAILED", "unknown"],
    ["PROCESSING", "unknown"],
    [undefined, "unknown"],
  ])("mapeia status %s para %s sem promovê-lo a paid", (input, expected) => {
    expect(interpretStatus(input)).toBe(expected);
  });

  it("aceita os campos snake_case exemplificados e tolera QR ausente ou malformado", () => {
    expect(normalizePix({ qr_code: "data:image/png;base64,abc", copy_paste: " 000201... ", expires_at: "2026-10-29T00:00:00Z" }))
      .toEqual({ qrCode: "data:image/png;base64,abc", copyPaste: "000201...", expiresAt: "2026-10-29T00:00:00Z" });
    expect(normalizePix({ copy_paste: "000201..." })).toEqual({ qrCode: null, copyPaste: "000201...", expiresAt: null });
    expect(normalizePix({ qr_code: {}, copy_paste: "" })).toEqual({ qrCode: null, copyPaste: null, expiresAt: null });
  });
});

describe("BravoPay: assinatura e eventos webhook", () => {
  const secret = "whsec-test-only";
  const nowMs = 1_800_000_000_000;
  const timestamp = Math.floor(nowMs / 1000);
  const rawBody = JSON.stringify({
    id: "evt_stable_123",
    type: "transaction.paid",
    created: timestamp,
    data: {
      id: "tx_123",
      status: "PAID",
      amount_cents: 2590,
      external_reference: "order-42",
      customer: { email: "private@example.test" },
    },
  });

  it("valida HMAC-SHA256 sobre timestamp + corpo bruto exato", () => {
    const header = signatureFor(rawBody, secret, timestamp);
    expect(verifyWebhookSignature(rawBody, header, secret, 300, nowMs)).toBe(true);
    expect(verifyWebhookSignature(`${rawBody} `, header, secret, 300, nowMs)).toBe(false);
    const parsed = parseBravopayWebhook(rawBody, new Headers({ "BravoPay-Signature": header }), {
      BRAVOPAY_WEBHOOK_SECRET: secret,
    } as Record<string, string | undefined>, nowMs);
    expect(parsed).toMatchObject({
      ok: true,
      event: {
        eventId: "evt_stable_123",
        type: "transaction.paid",
        transactionId: "tx_123",
        status: "paid",
        amountCents: 2590,
        externalReference: "order-42",
      },
    });
    expect(JSON.stringify(parsed)).not.toContain("private@example.test");
  });

  it("rejeita assinatura inválida, secreta ausente e assinatura fora da tolerância", () => {
    const good = signatureFor(rawBody, secret, timestamp);
    expect(parseBravopayWebhook(rawBody, new Headers({ "X-Bravopay-Signature": good.replace(/.$/, "0") }), {
      BRAVOPAY_WEBHOOK_SECRET: secret,
    } as Record<string, string | undefined>, nowMs)).toMatchObject({ ok: false, reason: "invalid_signature" });
    expect(parseBravopayWebhook(rawBody, new Headers({ "BravoPay-Signature": good }), {} as Record<string, string | undefined>, nowMs))
      .toMatchObject({ ok: false, reason: "missing_secret" });

    const oldHeader = signatureFor(rawBody, secret, timestamp - 301);
    expect(parseBravopayWebhook(rawBody, new Headers({ "BravoPay-Signature": oldHeader }), {
      BRAVOPAY_WEBHOOK_SECRET: secret,
    } as Record<string, string | undefined>, nowMs)).toMatchObject({ ok: false, reason: "expired_signature" });
    expect(verifyWebhookSignature(rawBody, oldHeader, secret, 300, nowMs)).toBe(false);
  });

  it("rejeita payload inválido e headers canônico/alias divergentes", () => {
    const signedInvalidJson = signatureFor("{", secret, timestamp);
    expect(parseBravopayWebhook("{", new Headers({ "BravoPay-Signature": signedInvalidJson }), {
      BRAVOPAY_WEBHOOK_SECRET: secret,
    } as Record<string, string | undefined>, nowMs)).toMatchObject({ ok: false, reason: "invalid_payload" });
    const valid = signatureFor(rawBody, secret, timestamp);
    expect(parseBravopayWebhook(rawBody, new Headers({
      "BravoPay-Signature": valid,
      "X-Bravopay-Signature": "t=1,v1=" + "0".repeat(64),
    }), { BRAVOPAY_WEBHOOK_SECRET: secret } as Record<string, string | undefined>, nowMs))
      .toMatchObject({ ok: false, reason: "invalid_signature" });
  });

  it("expõe deduplicação pura pelo eventId estável sem fingir persistência", () => {
    const event = { eventId: "evt_stable_123" };
    expect(isDuplicateWebhookEvent(event, new Set())).toBe(false);
    expect(isDuplicateWebhookEvent(event, new Set(["evt_stable_123"]))).toBe(true);
  });

  it("não interpreta status de evento desconhecido como confirmação de pagamento", () => {
    const body = JSON.stringify({ id: "evt_withdrawal", type: "withdrawal.paid", data: { id: "wd_1", status: "PAID" } });
    const header = signatureFor(body, secret, timestamp);
    const parsed = parseBravopayWebhook(body, new Headers({ "BravoPay-Signature": header }), {
      BRAVOPAY_WEBHOOK_SECRET: secret,
    }, nowMs);
    expect(parsed).toMatchObject({ ok: true, event: { status: "unknown" } });
  });
});
