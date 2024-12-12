import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Send, Paperclip, MoreVertical, MinusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatMessage } from '@/types/chat';

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (isScrolledToBottomRef.current && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Track scroll position
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      isScrolledToBottomRef.current =
        Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: uuidv4(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    isScrolledToBottomRef.current = true;

    // Simulate API response
    setTimeout(() => {
      const response: ChatMessage = {
        id: uuidv4(),
        content: 'This is a simulated response from the support team.',
        sender: 'assistant',
        timestamp: new Date(),
        status: 'sent',
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex h-[600px] w-full flex-col">
      <CardHeader className="flex-none">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Support Chat</CardTitle>
            <CardDescription>Get help from our support team</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <MinusCircle className="mr-2 h-4 w-4" />
                Clear Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div
          ref={scrollAreaRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-4"
        >
          <div className="py-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-4 flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="mt-1 block text-xs opacity-70">
                      {format(message.timestamp, 'HH:mm')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-none border-t p-4">
        <div className="flex w-full items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Chat;
