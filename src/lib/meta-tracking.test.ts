import { afterEach, describe, expect, it, vi } from "vitest";
import { getPixelConfigurations, sanitizeMetaParameters, trackMetaEvent } from "./meta-tracking";

const names = [
  "NEXT_PUBLIC_META_PIXEL_VENDAS02_A",
  "NEXT_PUBLIC_META_PIXEL_VENDAS02_A_ENABLED",
  "NEXT_PUBLIC_META_PIXEL_VENDAS02_A_EVENTS",
  "NEXT_PUBLIC_META_PIXEL_VENDAS01",
  "NEXT_PUBLIC_META_PIXEL_VENDAS01_ENABLED",
  "NEXT_PUBLIC_META_PIXEL_VENDAS01_EVENTS",
  "NEXT_PUBLIC_META_PIXEL_VENDAS02_B",
  "NEXT_PUBLIC_META_PIXEL_VENDAS02_B_ENABLED",
  "NEXT_PUBLIC_META_PIXEL_VENDAS02_B_EVENTS",
  "NEXT_PUBLIC_META_PIXEL_VENDAS03",
  "NEXT_PUBLIC_META_PIXEL_VENDAS03_ENABLED",
  "NEXT_PUBLIC_META_PIXEL_VENDAS03_EVENTS",
] as const;
const previous = new Map(names.map((name) => [name, process.env[name]]));

afterEach(() => {
  vi.unstubAllGlobals();
  for (const name of names) {
    const value = previous.get(name);
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("gerenciador Meta", () => {
  it("preserva as duas configurações com nome VENDAS02 como destinos distintos", () => {
    process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_A = "2298008410985632";
    process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_B = "1453520040067694";
    process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_A_ENABLED = "false";
    process.env.NEXT_PUBLIC_META_PIXEL_VENDAS02_B_ENABLED = "false";
    const pixels = getPixelConfigurations();
    expect(pixels.filter((pixel) => pixel.key.startsWith("VENDAS02"))).toHaveLength(2);
    expect(new Set(pixels.map((pixel) => pixel.id)).size).toBe(pixels.length);
  });

  it("não habilita Pixel sem opt-in individual explícito", () => {
    for (const name of names) delete process.env[name];
    const pixels = getPixelConfigurations();
    expect(pixels).toHaveLength(0);
  });

  it("ignora IDs inválidos e eventos fora da allowlist", () => {
    process.env.NEXT_PUBLIC_META_PIXEL_VENDAS01 = "not-a-pixel";
    process.env.NEXT_PUBLIC_META_PIXEL_VENDAS01_ENABLED = "true";
    process.env.NEXT_PUBLIC_META_PIXEL_VENDAS01_EVENTS = "PageView,Email,Purchase";
    expect(getPixelConfigurations()).toHaveLength(0);
  });

  it("limita parâmetros a conteúdo público seguro e moeda BRL", () => {
    const unsafe = { content_name: "maria silva", content_category: "informacao_publica", currency: "USD", email: "maria@example.com", value: Number.POSITIVE_INFINITY } as unknown as Record<string, string | number | boolean>;
    expect(sanitizeMetaParameters(unsafe)).toEqual({ content_category: "informacao_publica" });
  });

  it("bloqueia Purchase até existir confirmação de pagamento no servidor", () => {
    vi.stubGlobal("window", { localStorage: { getItem: () => "accepted" } });
    expect(trackMetaEvent("Purchase", { value: 999, currency: "BRL" }, { eventId: "12345678-1234-4234-8234-123456789abc" })).toBeNull();
  });
});
