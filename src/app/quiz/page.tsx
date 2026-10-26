import type { Metadata } from "next";
import { QuizFlow } from "@/components/QuizFlow";

export const metadata: Metadata = { title: "Quiz informativo" };

export default function QuizPage() {
  return <QuizFlow />;
}
