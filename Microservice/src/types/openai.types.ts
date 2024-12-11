export interface OpenAIRequestBody {
  messages: Array<{ role: string; content: string }>;
  selectedModel?: string;
  maxTokens?: number;
}

export interface OpenAIResponse {
  data: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
}
