import { describe, it, expect } from 'vitest';
import compileContext from './compile-context';

describe('compileContext', () => {
  it('compiles questions and answers into a context string', () => {
    const questions = ['What is your name?', 'What is your role?'];
    const answers = ['John', 'Developer'];

    const result = compileContext(questions, answers);

    expect(result).toContain('Question: What is your name?');
    expect(result).toContain('Answer: John');
    expect(result).toContain('Question: What is your role?');
    expect(result).toContain('Answer: Developer');
  });

  it('formats each QA pair on separate lines', () => {
    const questions = ['Q1', 'Q2'];
    const answers = ['A1', 'A2'];

    const result = compileContext(questions, answers);

    expect(result).toBe('Question: Q1\nAnswer: A1\n\nQuestion: Q2\nAnswer: A2\n\n');
  });

  it('uses N/A for missing answers', () => {
    const questions = ['Q1', 'Q2', 'Q3'];
    const answers = ['A1'];

    const result = compileContext(questions, answers);

    expect(result).toContain('Answer: A1');
    expect(result).toContain('Answer: N/A');
  });

  it('uses N/A for empty string answers', () => {
    const questions = ['Q1', 'Q2'];
    const answers = ['A1', ''];

    const result = compileContext(questions, answers);

    expect(result).toContain('Answer: A1');
    expect(result).toContain('Answer: N/A');
  });

  it('returns empty string for empty arrays', () => {
    const result = compileContext([], []);

    expect(result).toBe('');
  });

  it('handles single question and answer', () => {
    const questions = ['What is the project name?'];
    const answers = ['SpecTree'];

    const result = compileContext(questions, answers);

    expect(result).toBe('Question: What is the project name?\nAnswer: SpecTree\n\n');
  });

  it('preserves special characters in questions and answers', () => {
    const questions = ['What are the requirements? (Phase 1)'];
    const answers = ['1. Feature A\n2. Feature B'];

    const result = compileContext(questions, answers);

    expect(result).toContain('What are the requirements? (Phase 1)');
    expect(result).toContain('1. Feature A\n2. Feature B');
  });

  it('handles many questions', () => {
    const questions = Array(10)
      .fill(0)
      .map((_, i) => `Question ${i + 1}`);
    const answers = Array(10)
      .fill(0)
      .map((_, i) => `Answer ${i + 1}`);

    const result = compileContext(questions, answers);

    expect(result).toContain('Question: Question 1');
    expect(result).toContain('Question: Question 10');
    expect(result).toContain('Answer: Answer 1');
    expect(result).toContain('Answer: Answer 10');
  });
});
