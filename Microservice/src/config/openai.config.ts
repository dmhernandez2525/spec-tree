import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const defaultConfig = {
  temperature: 0.5,
  max_tokens: {
    default: 4096,
    extended: 10000,
  },
  models: {
    default: 'gpt-3.5-turbo-16k',
    gpt4: 'gpt-4-turbo-preview',
  },
};
