const compileContext = (questions: string[], answers: string[]): string => {
  let contextString = '';
  questions.forEach((question, index) => {
    contextString += `Question: ${question}\nAnswer: ${
      answers[index] || 'N/A'
    }\n\n`;
  });
  return contextString;
};

export default compileContext;
