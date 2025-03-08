
import { useState } from 'react';
import { geminiService } from '@/services/openai';
import { useToast } from './use-toast';
import { ChatMessage } from '@/types/api';

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const setApiKey = (apiKey: string) => {
    const success = geminiService.setApiKey(apiKey);
    if (success) {
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully"
      });
    }
    return success;
  };

  const getApiKey = () => {
    return geminiService.getApiKey();
  };

  const clearApiKey = () => {
    geminiService.clearApiKey();
    toast({
      title: "API Key Removed",
      description: "Your Gemini API key has been removed"
    });
  };

  const generateResponse = async (
    messages: ChatMessage[],
    options: { model?: string; temperature?: number; max_tokens?: number } = {}
  ) => {
    setLoading(true);
    try {
      const response = await geminiService.createChatCompletion(messages, options);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      return null;
    }
  };

  return {
    loading,
    setApiKey,
    getApiKey,
    clearApiKey,
    generateResponse
  };
};
