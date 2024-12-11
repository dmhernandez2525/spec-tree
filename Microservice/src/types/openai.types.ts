export interface OpenAIRequestBody {
  systemPrompt: string;
  userPrompt: string;
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
