import React from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboards/ui/card';
import { Button } from '@/components/dashboards/ui/button';
import { Input } from '@/components/dashboards/ui/input';
import { Badge } from '@/components/dashboards/ui/badge';
import { ScrollArea } from '@/components/dashboards/ui/scroll-area';
import { Separator } from '@/components/dashboards/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/utils/APIUrl';
import {
  Bot,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Trash2,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';

type Audience = 'patient' | 'dentist';

type Message = {
  id: string;
  role: 'assistant' | 'user' | 'error';
  content: string;
};

type ChatbotPanelProps = {
  title?: string;
  description?: string;
  audience?: Audience;
};

const chatbotBase = import.meta.env.VITE_CHATBOT_URL;
const CHATBOT_ENDPOINT = `${chatbotBase?.replace(/\/$/, '')}/ask`;

const makeId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
};

const extractAnswer = (payload: any): string => {
  if (!payload) return 'Sorry, I could not get a response right now.';
  if (typeof payload === 'string') return payload;
  return (
    payload.answer ||
    payload.message ||
    payload.response ||
    payload.data?.answer ||
    payload.data?.message ||
    payload.data?.response ||
    'Thanks for your question. Please try again if you need more details.'
  );
};

const makeWelcomeMessage = (audience: Audience): Message => ({
  id: 'welcome',
  role: 'assistant',
  content:
    audience === 'dentist'
      ? 'Hi doctor! I can help with quick clinical guidance, patient education tips, and insurance-friendly phrasing.'
      : 'Hi there! I am your dental care assistant. Ask me about symptoms, after-visit care, or how to prepare for an appointment.',
});

const ChatbotPanel: React.FC<ChatbotPanelProps> = ({
  title = 'Dental Chatbot',
  description,
  audience = 'patient',
}) => {
  const { toast } = useToast();
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([makeWelcomeMessage(audience)]);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const samplePrompts =
    audience === 'dentist'
      ? [
          'How should I explain post-extraction care in simple terms?',
          'Give a quick checklist for virtual consults.',
        ]
      : [
          'What should I do for sudden tooth pain before my visit?',
          'How do I care for my teeth after a cleaning?',
        ];

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await axios.post(CHATBOT_ENDPOINT, { message: question });
      return response.data;
    },
    onSuccess: (data, question) => {
      const answer = extractAnswer(data);
      setMessages(prev => [
        ...prev,
        { id: makeId(), role: 'assistant', content: answer || 'Let me know if you need more help.' },
      ]);
      if (!question) return;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setMessages(prev => [
        ...prev,
        {
          id: makeId(),
          role: 'error',
          content: err?.response?.data?.message || 'I could not reach the assistant. Please try again shortly.',
        },
      ]);
      toast({
        title: 'Chatbot unavailable',
        description: err?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    },
  });

  const handleClear = () => {
    setMessages([]);
  };

  const handleNewChat = () => {
    setMessages([makeWelcomeMessage(audience)]);
  };

  const handleSend = (value?: string) => {
    const text = (value ?? input).trim();
    if (!text || askMutation.isPending) return;

    const userMessage: Message = { id: makeId(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    askMutation.mutate(text);
  };

  return (
    <Card className="flex flex-col h-full min-h-[500px] max-h-[700px]">
      <CardHeader className="flex-shrink-0 pb-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClear}
              className="text-xs sm:text-sm"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <Button 
              size="sm" 
              onClick={handleNewChat}
              className="text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {description ||
            (audience === 'dentist'
              ? 'Ask for talking points, quick education blurbs, or appointment prep guidance.'
              : 'Get quick answers about dental care, symptoms, and post-visit instructions.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1 min-h-0 p-4 sm:p-6">
        {samplePrompts.length > 0 && (
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            {samplePrompts.map(prompt => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="text-left text-xs sm:text-sm h-auto py-2 px-3 whitespace-normal"
                onClick={() => handleSend(prompt)}
              >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
                <span className="line-clamp-2">{prompt}</span>
              </Button>
            ))}
          </div>
        )}

        <Separator className="flex-shrink-0" />

        <ScrollArea className="flex-1 min-h-0 rounded-lg border bg-muted/20">
          <div ref={scrollRef} className="p-3 sm:p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 sm:gap-3 rounded-lg p-2.5 sm:p-3 transition-colors ${
                    message.role === 'user'
                      ? 'bg-primary/5 border border-primary/10 ml-4 sm:ml-8'
                      : message.role === 'error'
                      ? 'bg-destructive/10 border border-destructive/20'
                      : 'bg-muted/50 border border-border mr-4 sm:mr-8'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    {message.role === 'error' && (
                      <Badge variant="destructive" className="text-[10px] mb-1">
                        Error
                      </Badge>
                    )}
                    <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))
            )}
            {askMutation.isPending && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Input
            placeholder={
              audience === 'dentist'
                ? 'Ask for guidance...'
                : 'Ask about dental care...'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 text-sm sm:text-base"
          />
          <Button 
            onClick={() => handleSend()} 
            disabled={askMutation.isPending || !input.trim()}
            className="w-full sm:w-auto"
          >
            {askMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </div>

        <div className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground flex-shrink-0 pt-1">
          <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
          <span>AI guidance is informational and not a medical diagnosis. Follow your care plan.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotPanel;

