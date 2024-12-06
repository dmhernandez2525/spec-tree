const validateAnswers = (questions: string[], answers: string[]): boolean => {
  return questions.every((_, index) => answers[index]);
};

export default validateAnswers;
