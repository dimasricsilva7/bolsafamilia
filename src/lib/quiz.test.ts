import { afterEach, describe, expect, it } from "vitest";
import { answerLabel, isAnswerComplete, quizQuestions, safeQuizAnswers } from "./quiz";

describe("quiz informativo", () => {
  it("tem seis perguntas e não solicita identificadores pessoais", () => {
    expect(quizQuestions).toHaveLength(6);
    const serialized = JSON.stringify(quizQuestions).toLowerCase();
    expect(serialized).not.toContain("cpf");
    expect(serialized).not.toContain("senha");
    expect(serialized).not.toContain("documento");
  });

  it("permite responder prefiro não informar e valida multisseleção", () => {
    const one = quizQuestions[0];
    const multiple = quizQuestions.find((question) => question.type === "multiple");
    expect(one).toBeDefined();
    expect(multiple).toBeDefined();
    expect(isAnswerComplete(one!, "skip")).toBe(true);
    expect(isAnswerComplete(multiple!, [])).toBe(false);
    expect(isAnswerComplete(multiple!, ["food"])).toBe(true);
  });

  it("filtra respostas desconhecidas e elimina valores repetidos", () => {
    const parsed = safeQuizAnswers({ receives: "yes", amount: "INVALID", expenses: ["food", "food", "cpf"] });
    expect(parsed).toEqual({ receives: "yes", expenses: ["food"] });
  });

  it("mostra as respostas sem inferir elegibilidade", () => {
    const question = quizQuestions[0];
    expect(answerLabel(question, "yes")).toBe("Sim, recebo atualmente");
    expect(answerLabel(question, "unknown")).toBe("Resposta não reconhecida");
  });
});

afterEach(() => {
  // Sem estado global persistido pelos testes.
});
