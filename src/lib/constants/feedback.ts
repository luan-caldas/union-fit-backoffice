export type FeedbackQuestionDef = {
  label: string
  answers: Record<string, string>
}

// Ordem das chaves = ordem de exibição no app.
export const SESSION_FEEDBACK: Record<string, FeedbackQuestionDef> = {
  difficulty: {
    label: "O que achou do seu treino?",
    answers: {
      hard: "Difícil",
      just_right: "Na medida certa para mim!",
      easy: "Fácil",
    },
  },
}

export const CYCLE_FEEDBACK: Record<string, FeedbackQuestionDef> = {
  satisfaction: {
    label: "Como você avalia o seu nível de satisfação com os treinos realizados?",
    answers: {
      very_satisfied: "Muito satisfeito",
      satisfied: "Satisfeito",
      neutral: "Neutro",
      dissatisfied: "Insatisfeito",
      very_dissatisfied: "Muito insatisfeito",
    },
  },
  discomfort: {
    label: "Você sentiu alguma dor ou desconforto em algum momento?",
    answers: {
      never: "Não",
      rarely: "Raramente",
      sometimes: "Às vezes",
      often: "Frequentemente",
      always: "Sempre",
    },
  },
  improvement: {
    label: "Você notou alguma melhora em sua condição física?",
    answers: {
      very_significant: "Muito significativa",
      significant: "Significativa",
      moderate: "Moderada",
      little: "Pouca",
      none: "Nenhuma",
    },
  },
}

export function questionLabel(
  defs: Record<string, FeedbackQuestionDef>,
  question: string
): string {
  return defs[question]?.label ?? question
}

export function answerLabel(
  defs: Record<string, FeedbackQuestionDef>,
  question: string,
  answer: string
): string {
  return defs[question]?.answers[answer] ?? answer
}
