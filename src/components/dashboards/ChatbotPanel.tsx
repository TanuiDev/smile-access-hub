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
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="mr-1 h-4 w-4" />
              Clear
            </Button>
            <Button size="sm" onClick={handleNewChat}>
              <RefreshCw className="mr-1 h-4 w-4" />
              New chat
            </Button>
          </div>
        </div>
        <CardDescription>
          {description ||
            (audience === 'dentist'
              ? 'Ask for talking points, quick education blurbs, or appointment prep guidance.'
              : 'Get quick answers about dental care, symptoms, and post-visit instructions.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map(prompt => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              className="text-left"
              onClick={() => handleSend(prompt)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {prompt}
            </Button>
          ))}
        </div>

        <Separator />

        <ScrollArea className="h-72 rounded-md border bg-muted/30">
          <div ref={scrollRef} className="p-3 space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start gap-2 rounded-lg border p-3 ${
                  message.role === 'user' ? 'bg-background' : 'bg-muted'
                }`}
              >
                <div className="mt-0.5">
                  {message.role === 'user' ? (
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1 text-sm leading-relaxed">
                  {message.role === 'error' && (
                    <Badge variant="destructive" className="text-[10px]">
                      Error
                    </Badge>
                  )}
                  <p className="text-muted-foreground whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {askMutation.isPending && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder={
              audience === 'dentist'
                ? 'Ask for phrasing, patient education tips, or quick guidance...'
                : 'Ask about dental care, symptoms, or after-visit steps...'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={() => handleSend()} disabled={askMutation.isPending || !input.trim()}>
            {askMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>AI guidance is informational and not a medical diagnosis. Follow your care plan.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotPanel;

