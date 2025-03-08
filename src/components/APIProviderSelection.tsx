
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOpenAI } from '@/hooks/useOpenAI';
import { useGemini } from '@/hooks/useGemini';

type APIProvider = 'openai' | 'gemini';

export interface APIProviderSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProvider?: APIProvider;
}

const APIProviderSelection = ({ open, onOpenChange, defaultProvider = 'openai' }: APIProviderSelectionProps) => {
  const [provider, setProvider] = useState<APIProvider>(defaultProvider);
  const [openAIKey, setOpenAIKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  
  const { setApiKey: setOpenAIApiKey, getApiKey: getOpenAIApiKey } = useOpenAI();
  const { setApiKey: setGeminiApiKey, getApiKey: getGeminiApiKey } = useGemini();
  
  // Initialize API key fields if they exist
  React.useEffect(() => {
    const openAIApiKey = getOpenAIApiKey();
    if (openAIApiKey) {
      setOpenAIKey(openAIApiKey);
    }
    
    const geminiApiKey = getGeminiApiKey();
    if (geminiApiKey) {
      setGeminiKey(geminiApiKey);
    }
  }, [open]);
  
  const handleSave = () => {
    if (provider === 'openai' && openAIKey.trim()) {
      setOpenAIApiKey(openAIKey.trim());
    } else if (provider === 'gemini' && geminiKey.trim()) {
      setGeminiApiKey(geminiKey.trim());
    }
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-cyber-background border border-cyber-neon/30 text-white">
        <DialogHeader>
          <DialogTitle className="cyber-heading text-xl">AI API Configuration</DialogTitle>
          <DialogDescription className="text-cyber-muted-text">
            Configure your AI API provider for the mentor functionality.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={provider} onValueChange={(value) => setProvider(value as APIProvider)}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="gemini">Gemini</TabsTrigger>
          </TabsList>
          
          <TabsContent value="openai" className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="openaiKey" className="text-sm font-medium text-white">
                OpenAI API Key
              </label>
              <Input
                id="openaiKey"
                type="password"
                placeholder="sk-..."
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                className="bg-cyber-background-alt border-cyber-neon/30"
              />
              <p className="text-xs text-cyber-muted-text">
                Your API key is stored locally in your browser and never sent to our servers.
                Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyber-neon underline">OpenAI's dashboard</a>.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="gemini" className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="geminiKey" className="text-sm font-medium text-white">
                Gemini API Key
              </label>
              <Input
                id="geminiKey"
                type="password"
                placeholder="AI..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="bg-cyber-background-alt border-cyber-neon/30"
              />
              <p className="text-xs text-cyber-muted-text">
                Your API key is stored locally in your browser and never sent to our servers.
                Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyber-neon underline">Google AI Studio</a>.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-cyber-red/30 text-cyber-red hover:bg-cyber-red/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="cyber-button-primary"
            disabled={(provider === 'openai' && !openAIKey.trim()) || (provider === 'gemini' && !geminiKey.trim())}
          >
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default APIProviderSelection;
