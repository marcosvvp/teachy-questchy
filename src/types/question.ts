export type QuestionType = "OpenText" | "MultipleChoice" | "Ranking";

export type BaseQuestion = {
  id: string;
  code: string;
  title: string;
  type: QuestionType;
  correctAnswers?: string[];
  studentsCount?: number;
  image?: Blob;
};

export type OpenTextQuestion = BaseQuestion & {
  type: "OpenText";
};

export type MultipleChoiceQuestion = BaseQuestion & {
  type: "MultipleChoice";
  options: string[];
};

export type RankingQuestion = BaseQuestion & {
  type: "Ranking";
  options: string[];
};

export type Question = OpenTextQuestion | MultipleChoiceQuestion | RankingQuestion;
