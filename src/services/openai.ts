
import { toast } from "@/hooks/use-toast";

// Types for API requests
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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

// OpenAI Service class
class OpenAIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';
  private defaultModel = 'gpt-4o-mini';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    // Store in localStorage for persistence
    localStorage.setItem('openai_api_key', apiKey);
    return true;
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      // Try to get from localStorage
      const storedKey = localStorage.getItem('openai_api_key');
      if (storedKey) {
        this.apiKey = storedKey;
      }
    }
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('openai_api_key');
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options: { model?: string; temperature?: number; max_tokens?: number } = {}
  ): Promise<ChatMessage | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please set your OpenAI API key in the settings",
        variant: "destructive"
      });
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: options.model || this.defaultModel,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to connect to OpenAI API');
      }

      const data: OpenAICompletionResponse = await response.json();
      return data.choices[0].message;
    } catch (error: any) {
      toast({
        title: "AI Request Failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
      console.error('OpenAI API Error:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const openaiService = new OpenAIService();

// Gemini Service class
class GeminiService {
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private defaultModel = 'gemini-pro';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    // Store in localStorage for persistence
    localStorage.setItem('gemini_api_key', apiKey);
    return true;
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      // Try to get from localStorage
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) {
        this.apiKey = storedKey;
      }
    }
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('gemini_api_key');
  }

  // Convert OpenAI format messages to Gemini format
  private convertToGeminiMessages(messages: ChatMessage[]): GeminiMessage[] {
    return messages.filter(msg => msg.role !== 'system').map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options: { model?: string; temperature?: number; max_tokens?: number } = {}
  ): Promise<ChatMessage | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please set your Gemini API key in the settings",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Extract system message
      const systemMessage = messages.find(msg => msg.role === 'system');
      
      // Convert messages to Gemini format
      const geminiMessages = this.convertToGeminiMessages(messages);
      
      // For Gemini, we need to include the system message as a prefix to the first user message
      if (systemMessage && geminiMessages.length > 0 && geminiMessages[0].role === 'user') {
        geminiMessages[0].parts[0].text = `${systemMessage.content}\n\n${geminiMessages[0].parts[0].text}`;
      }

      const model = options.model || this.defaultModel;
      const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.max_tokens
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to connect to Gemini API');
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API');
      }
      
      // Convert Gemini response back to OpenAI format
      return {
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text
      };
    } catch (error: any) {
      toast({
        title: "AI Request Failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
      console.error('Gemini API Error:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();
