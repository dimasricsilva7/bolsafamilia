import type { Metadata } from "next";
import { ResultSummary } from "@/components/ResultSummary";

export const metadata: Metadata = { title: "Resumo informativo" };

export default function ResultPage() {
  return <ResultSummary />;
}
