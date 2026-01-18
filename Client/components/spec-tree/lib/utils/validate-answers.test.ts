import { describe, it, expect } from 'vitest';
import validateAnswers from './validate-answers';

describe('validateAnswers', () => {
  it('returns true when all questions have answers', () => {
    const questions = ['Question 1', 'Question 2', 'Question 3'];
    const answers = ['Answer 1', 'Answer 2', 'Answer 3'];

    const result = validateAnswers(questions, answers);
    expect(result).toBe(true);
  });

  it('returns false when some answers are missing', () => {
    const questions = ['Question 1', 'Question 2', 'Question 3'];
    const answers = ['Answer 1', '', 'Answer 3'];

    const result = validateAnswers(questions, answers);
    expect(result).toBe(false);
  });

  it('returns false when answers array is shorter than questions', () => {
    const questions = ['Question 1', 'Question 2', 'Question 3'];
    const answers = ['Answer 1'];

    const result = validateAnswers(questions, answers);
    expect(result).toBe(false);
  });

  it('returns true for empty questions array', () => {
    const questions: string[] = [];
    const answers: string[] = [];

    const result = validateAnswers(questions, answers);
    expect(result).toBe(true);
  });

  it('returns false when answer is undefined', () => {
    const questions = ['Question 1', 'Question 2'];
    const answers = ['Answer 1'] as string[];

    const result = validateAnswers(questions, answers);
    expect(result).toBe(false);
  });

  it('returns false when answer is null-ish', () => {
    const questions = ['Question 1', 'Question 2'];
    const answers = ['Answer 1', null as unknown as string];

    const result = validateAnswers(questions, answers);
    expect(result).toBe(false);
  });
});
