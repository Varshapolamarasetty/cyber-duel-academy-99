
import { useState } from 'react';
import { openaiService } from '@/services/openai';
import { useToast } from './use-toast';
import { ChatMessage } from '@/types/api';

export const useOpenAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const setApiKey = (apiKey: string) => {
    const success = openaiService.setApiKey(apiKey);
    if (success) {
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved successfully"
      });
    }
    return success;
  };

  const getApiKey = () => {
    return openaiService.getApiKey();
  };

  const clearApiKey = () => {
    openaiService.clearApiKey();
    toast({
      title: "API Key Removed",
      description: "Your OpenAI API key has been removed"
    });
  };

  const generateResponse = async (
    messages: ChatMessage[],
    options: { model?: string; temperature?: number; max_tokens?: number } = {}
  ) => {
    setLoading(true);
    try {
      const response = await openaiService.createChatCompletion(messages, options);
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
