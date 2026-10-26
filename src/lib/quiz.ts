export type AnswerValue = string | string[];
export type QuizAnswers = Record<string, AnswerValue>;
export type QuizQuestion = { id: string; title: string; hint: string; type: "single" | "multiple"; options: { value: string; label: string }[] };

export const QUIZ_STORAGE_KEY = "bolsa-familia-quiz-session-v1";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "receives",
    title: "Você recebe atualmente o Bolsa Família?",
    hint: "Esta resposta só será usada para montar seu resumo neste dispositivo.",
    type: "single",
    options: [
      { value: "yes", label: "Sim, recebo atualmente" },
      { value: "no", label: "Não recebo atualmente" },
      { value: "skip", label: "Prefiro não informar" },
    ],
  },
  {
    id: "amount",
    title: "Qual faixa corresponde ao valor mensal recebido?",
    hint: "Se não recebe o benefício ou não souber o valor, escolha uma das opções abaixo.",
    type: "single",
    options: [
      { value: "not_applicable", label: "Não se aplica" },
      { value: "up_to_300", label: "Até R$ 300" },
      { value: "301_600", label: "De R$ 301 a R$ 600" },
      { value: "601_900", label: "De R$ 601 a R$ 900" },
      { value: "over_900", label: "Acima de R$ 900" },
      { value: "unknown", label: "Não sei ou prefiro não informar" },
    ],
  },
  {
    id: "duration",
    title: "Há quanto tempo você recebe o benefício?",
    hint: "Escolha “Não se aplica” se não recebe atualmente.",
    type: "single",
    options: [
      { value: "not_applicable", label: "Não se aplica" },
      { value: "under_6m", label: "Há menos de 6 meses" },
      { value: "6m_1y", label: "Entre 6 meses e 1 ano" },
      { value: "1_3y", label: "Entre 1 e 3 anos" },
      { value: "over_3y", label: "Há mais de 3 anos" },
      { value: "unknown", label: "Não sei ou prefiro não informar" },
    ],
  },
  {
    id: "income_help",
    title: "Uma mudança na renda familiar ajudaria nas despesas?",
    hint: "Não existe análise de renda nem cálculo de benefício neste quiz.",
    type: "single",
    options: [
      { value: "yes_a_lot", label: "Sim, ajudaria bastante" },
      { value: "yes_some", label: "Sim, ajudaria um pouco" },
      { value: "not_sure", label: "Não tenho certeza" },
      { value: "prefer_not", label: "Prefiro não informar" },
    ],
  },
  {
    id: "expenses",
    title: "Quais despesas pesam mais no orçamento?",
    hint: "Selecione todas as opções que quiser. As respostas não saem desta sessão.",
    type: "multiple",
    options: [
      { value: "food", label: "Alimentação" },
      { value: "housing", label: "Moradia ou aluguel" },
      { value: "utilities", label: "Água, luz ou gás" },
      { value: "health", label: "Saúde e medicamentos" },
      { value: "education", label: "Educação e cuidados" },
      { value: "transport", label: "Transporte" },
      { value: "other", label: "Outras despesas" },
      { value: "prefer_not", label: "Prefiro não informar" },
    ],
  },
  {
    id: "official_info",
    title: "Gostaria de consultar informações oficiais sobre as regras do programa?",
    hint: "Vamos indicar páginas públicas do Governo Federal e canais de atendimento.",
    type: "single",
    options: [
      { value: "yes", label: "Sim, quero ver os canais oficiais" },
      { value: "later", label: "Talvez mais tarde" },
      { value: "prefer_not", label: "Prefiro não informar" },
    ],
  },
];

export function isAnswerComplete(question: QuizQuestion, answer: AnswerValue | undefined): boolean {
  if (question.type === "multiple") return Array.isArray(answer) && answer.length > 0;
  return typeof answer === "string" && answer.length > 0;
}

export function answerLabel(question: QuizQuestion, value: AnswerValue | undefined): string {
  if (!value || (Array.isArray(value) && value.length === 0)) return "Sem resposta";
  const values = Array.isArray(value) ? value : [value];
  const labels = values.map((item) => question.options.find((option) => option.value === item)?.label ?? "Resposta não reconhecida");
  return labels.join(", ");
}

export function safeQuizAnswers(value: unknown): QuizAnswers | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const result: QuizAnswers = {};
  for (const question of quizQuestions) {
    const answer = source[question.id];
    if (question.type === "single" && typeof answer === "string" && question.options.some((option) => option.value === answer)) result[question.id] = answer;
    if (question.type === "multiple" && Array.isArray(answer)) {
      const valid = answer.filter((item): item is string => typeof item === "string" && question.options.some((option) => option.value === item));
      if (valid.length) result[question.id] = [...new Set(valid)];
    }
  }
  return result;
}
