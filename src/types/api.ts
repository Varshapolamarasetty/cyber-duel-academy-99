
// Shared types for the OpenAI and Gemini API services
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ApiServiceOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

// OpenAI specific types
export interface OpenAICompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Gemini specific types
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: {
    text: string;
  }[];
}

export interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
  }[];
  promptFeedback: {
    safetyRatings: any[];
  };
}
