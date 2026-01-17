import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../lib/store';
import { selectChatApi } from '../../../../lib/store/sow-slice';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { askQuestion } from '../../lib/api/openai';

interface ChatProps {
  onClose?: () => void;
}

// _onClose reserved for modal/dialog close callback integration
const Chat: React.FC<ChatProps> = ({ onClose: _onClose }) => {
  const selectedModel = useSelector(
    (state: RootState) => state.sow.selectedModel
  );
  const chatApi = useSelector(selectChatApi);
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await askQuestion({
        question,
        selectedModel,
        chatApi,
      });
      const responseData = response.data.choices[0].message.content;
      setResponse(responseData);
    } catch (_err) {
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        Open Chat
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>AI Assistant Chat</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-[400px] pr-4">
              {response && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose prose-sm max-w-none">{response}</div>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>

            <div className="space-y-2">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="min-h-[100px]"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAskQuestion}
              disabled={isLoading || !question.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Ask Question'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Chat;
