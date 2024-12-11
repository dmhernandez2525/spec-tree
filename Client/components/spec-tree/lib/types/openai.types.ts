export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIChoice {
  message: {
    content: string;
  };
  index: number;
  finish_reason: string;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
}

export interface ProxyResponse {
  data: OpenAIResponse;
  status: number;
}

export interface ProxyError extends Error {
  status?: number;
  code?: string;
  response?: {
    data?: {
      error?: {
        message: string;
        type: string;
        code: string;
      };
    };
  };
}
