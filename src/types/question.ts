export type QuestionType = "OpenText" | "MultipleChoice" | "Ranking" | "Map";

export type BaseQuestion = {
  id: string;
  code: string;
  title: string;
  type: QuestionType;
  // For Map, correctAnswers[0] will hold a JSON string of {lat, lng}
  // For OpenText, correctAnswers[0] will hold the correct answer
  // For MultipleChoice, correctAnswers[0] will hold the index of the correct answer
  // For Ranking, correctAnswers[0] will hold the indices of the correct answers in order
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

export type MapQuestion = BaseQuestion & {
  type: "Map";
};

export type Question = OpenTextQuestion | MultipleChoiceQuestion | RankingQuestion | MapQuestion;
