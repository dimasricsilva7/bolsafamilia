import type { Metadata } from "next";
import { ConsentBanner } from "@/components/ConsentBanner";
import { MetaRouteTracker } from "@/components/MetaRouteTracker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bolsa Família: informação clara",
    template: "%s | Bolsa Família: informação clara",
  },
  description:
    "Quiz independente e informativo sobre o Bolsa Família. Sem consulta a sistemas do governo, sem promessa de aprovação e sem solicitação de CPF ou senha.",
  applicationName: "Bolsa Família: informação clara",
  icons: { icon: "/marca.svg" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <MetaRouteTracker />
        <SiteHeader />
        <main id="conteudo">{children}</main>
        <SiteFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}
