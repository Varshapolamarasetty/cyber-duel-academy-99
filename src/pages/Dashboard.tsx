
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GlitchText from '@/components/GlitchText';
import Terminal from '@/components/Terminal';
import { useOpenAI } from '@/hooks/useOpenAI';
import { useGemini } from '@/hooks/useGemini';
import { ChatMessage } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const { user } = useAuth();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'openai' | 'gemini'>('openai');
  const [mentorInput, setMentorInput] = useState('');
  const [aiResponses, setAiResponses] = useState<string[]>([
    "Connecting to AI Mentor...",
    "Connection established."
  ]);
  
  const openai = useOpenAI();
  const gemini = useGemini();
  
  // Use the selected API provider
  const selectedApi = apiProvider === 'openai' ? openai : gemini;
  
  useEffect(() => {
    const hasApiKey = !!selectedApi.getApiKey();
    
    if (hasApiKey && user) {
      setAiResponses(prev => [
        ...prev,
        `Hello ${user.username}, I've analyzed your progress.`,
        "You're making good progress in web reconnaissance.",
        "I suggest focusing on HTTP header analysis next.",
        "Would you like me to prepare a practical exercise?",
      ]);
    } else if (!hasApiKey && user) {
      setAiResponses(prev => [
        ...prev,
        `Hello ${user.username}, to activate AI features,`,
        `please configure your ${apiProvider.toUpperCase()} API key.`,
      ]);
    }
  }, [user, apiProvider, selectedApi]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      selectedApi.setApiKey(apiKey.trim());
      setApiKeyModalOpen(false);
      
      if (user) {
        setAiResponses([
          "Connecting to AI Mentor...",
          "Connection established.",
          `Hello ${user.username}, I've analyzed your progress.`,
          "You're making good progress in web reconnaissance.",
          "I suggest focusing on HTTP header analysis next.",
          "Would you like me to prepare a practical exercise?",
        ]);
      }
    }
  };

  const handleSendMentorMessage = async () => {
    if (!mentorInput.trim() || selectedApi.loading) return;
    
    setAiResponses(prev => [...prev, `> ${mentorInput}`, "Processing..."]);
    setMentorInput('');
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an AI cybersecurity mentor for hackXtreme, an advanced cybersecurity training platform. 
        You are having a conversation with a student named ${user?.username || 'User'}. 
        Keep your responses brief (under 40 words when possible) and focused on cybersecurity training.
        Current context: The user is working on web application reconnaissance and learning about HTTP headers.`
      },
      {
        role: 'user',
        content: mentorInput
      }
    ];
    
    const response = await selectedApi.generateResponse(messages);
    
    if (response) {
      setAiResponses(prev => {
        const newResponses = [...prev];
        newResponses.pop();
        return [...newResponses, response.content];
      });
    } else {
      setAiResponses(prev => {
        const newResponses = [...prev];
        newResponses.pop();
        return [...newResponses, `Error connecting to ${apiProvider.toUpperCase()}. Please check your API key.`];
      });
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-cyber-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            <GlitchText text={`WELCOME, ${user.username.toUpperCase()}`} className="text-cyber-red" glitchOnHover />
          </h1>
          <p className="text-cyber-muted-text terminal-text">Security clearance: Level 1 | Role: {user.role}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="cyber-card p-1 rounded-lg overflow-hidden shadow-xl mb-6">
              <div className="bg-cyber-background-alt p-4 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-red via-cyber-red to-cyber-red"></div>
                <h2 className="text-xl font-bold text-white mb-4">Current Mission</h2>
                
                <div className="bg-cyber-background p-4 rounded border border-cyber-border mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-cyber-red terminal-text">MISSION #001</span>
                    <span className="bg-cyber-red/20 text-cyber-red px-2 py-1 rounded text-xs terminal-text">IN PROGRESS</span>
                  </div>
                  <h3 className="text-white text-lg mb-2">Web Application Reconnaissance</h3>
                  <p className="text-cyber-muted-text mb-4">Learn how to gather intelligence on web applications and identify potential vulnerabilities.</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="w-2/3">
                      <div className="h-2 bg-cyber-background-alt rounded-full overflow-hidden">
                        <div className="h-full bg-cyber-red" style={{ width: '35%' }}></div>
                      </div>
                      <div className="text-xs text-cyber-muted-text mt-1">35% Complete</div>
                    </div>
                    <button className="cyber-button-secondary text-xs px-3 py-1">CONTINUE</button>
                  </div>
                </div>
                
                <h3 className="text-white text-lg mb-2">Recommended Next Steps</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-1 h-1 rounded-full bg-cyber-red mt-2 mr-2"></span>
                    <span className="text-cyber-muted-text">Complete Basic Reconnaissance module</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1 h-1 rounded-full bg-cyber-red mt-2 mr-2"></span>
                    <span className="text-cyber-muted-text">Practice OSINT techniques in sandbox environment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1 h-1 rounded-full bg-cyber-red mt-2 mr-2"></span>
                    <span className="text-cyber-muted-text">Attempt Challenge #1: Find the hidden vulnerability</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="cyber-card p-1 rounded-lg overflow-hidden shadow-xl">
              <div className="bg-cyber-background-alt p-4 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-red via-cyber-red to-cyber-red"></div>
                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                
                <div className="space-y-4">
                  <div className="border-l-2 border-cyber-red pl-4 pb-4">
                    <p className="text-xs text-cyber-muted-text">Today, 14:32</p>
                    <p className="text-white">Completed lesson: "HTTP Headers and their Security Implications"</p>
                  </div>
                  <div className="border-l-2 border-cyber-red pl-4 pb-4">
                    <p className="text-xs text-cyber-muted-text">Today, 11:15</p>
                    <p className="text-white">Earned badge: "Network Scanner"</p>
                  </div>
                  <div className="border-l-2 border-cyber-red pl-4 pb-4">
                    <p className="text-xs text-cyber-muted-text">Yesterday, 19:45</p>
                    <p className="text-white">Started new mission: "Web Application Reconnaissance"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="cyber-card p-1 rounded-lg overflow-hidden shadow-xl mb-6">
              <div className="bg-cyber-background-alt p-4 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-red via-cyber-red to-cyber-red"></div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">AI Mentor</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setApiKeyModalOpen(true)}
                    className="text-cyber-muted-text hover:text-white"
                  >
                    <Settings size={16} />
                  </Button>
                </div>
                
                <Terminal 
                  text={aiResponses} 
                  className="h-[200px]" 
                  typingSpeed={30}
                />
                
                {selectedApi.getApiKey() ? (
                  <div className="mt-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Ask your AI mentor..."
                        value={mentorInput}
                        onChange={(e) => setMentorInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMentorMessage()}
                        className="bg-cyber-background border-cyber-red/30 text-white"
                      />
                      <Button 
                        className="cyber-button-primary" 
                        onClick={handleSendMentorMessage}
                        disabled={selectedApi.loading || !mentorInput.trim()}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      className="cyber-button-primary flex-1"
                      onClick={() => setApiKeyModalOpen(true)}
                    >
                      Configure API
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="cyber-card p-1 rounded-lg overflow-hidden shadow-xl">
              <div className="bg-cyber-background-alt p-4 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-red via-cyber-red to-cyber-red"></div>
                <h2 className="text-xl font-bold text-white mb-4">Stats</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-cyber-muted-text text-sm">XP</span>
                      <span className="text-cyber-red text-sm">1,240 / 2,000</span>
                    </div>
                    <div className="h-2 bg-cyber-background rounded-full overflow-hidden">
                      <div className="h-full bg-cyber-red" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-cyber-muted-text text-sm">Level</span>
                      <span className="text-cyber-red text-sm">3 / 20</span>
                    </div>
                    <div className="h-2 bg-cyber-background rounded-full overflow-hidden">
                      <div className="h-full bg-cyber-red" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl text-cyber-red font-bold">7</div>
                      <div className="text-xs text-cyber-muted-text">Challenges Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-cyber-red font-bold">4</div>
                      <div className="text-xs text-cyber-muted-text">Badges Earned</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen}>
        <DialogContent className="bg-cyber-background border border-cyber-neon/30 text-white">
          <DialogHeader>
            <DialogTitle className="cyber-heading text-xl">AI API Configuration</DialogTitle>
            <DialogDescription className="text-cyber-muted-text">
              Select your preferred AI provider and enter your API key.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup 
              defaultValue={apiProvider} 
              onValueChange={(value) => setApiProvider(value as 'openai' | 'gemini')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="openai" id="openai" className="text-cyber-red" />
                <Label htmlFor="openai" className="text-white cursor-pointer">OpenAI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gemini" id="gemini" className="text-cyber-red" />
                <Label htmlFor="gemini" className="text-white cursor-pointer">Google Gemini</Label>
              </div>
            </RadioGroup>
            
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium text-white">
                API Key for {apiProvider === 'openai' ? 'OpenAI' : 'Google Gemini'}
              </label>
              <Input
                id="apiKey"
                type="password"
                placeholder={apiProvider === 'openai' ? "sk-..." : "AIza..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-cyber-background-alt border-cyber-neon/30"
              />
              <p className="text-xs text-cyber-muted-text">
                Your API key is stored locally in your browser and never sent to our servers.
                {apiProvider === 'openai' ? (
                  <> Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-cyber-neon underline">OpenAI's dashboard</a>.</>
                ) : (
                  <> Get your API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-cyber-neon underline">Google AI Studio</a>.</>
                )}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApiKeyModalOpen(false)}
              className="border-cyber-red/30 text-cyber-red hover:bg-cyber-red/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveApiKey}
              className="cyber-button-primary"
              disabled={!apiKey.trim()}
            >
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
