import React, { useState } from 'react';
import { RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export type FeedbackType =
  | 'more_detailed'
  | 'simpler'
  | 'different_approach'
  | 'more_technical'
  | 'less_technical'
  | 'custom';

interface FeedbackOption {
  type: FeedbackType;
  label: string;
  prompt: string;
}

const feedbackOptions: FeedbackOption[] = [
  {
    type: 'more_detailed',
    label: 'More detailed',
    prompt: 'Please regenerate with more detail. Include additional specifications, edge cases, and implementation considerations.',
  },
  {
    type: 'simpler',
    label: 'Simpler',
    prompt: 'Please regenerate with a simpler approach. Focus on the core functionality and reduce complexity.',
  },
  {
    type: 'different_approach',
    label: 'Different approach',
    prompt: 'Please regenerate using a different approach or architecture. Consider alternative solutions.',
  },
  {
    type: 'more_technical',
    label: 'More technical',
    prompt: 'Please regenerate with more technical depth. Include specific technologies, patterns, and technical requirements.',
  },
  {
    type: 'less_technical',
    label: 'Less technical',
    prompt: 'Please regenerate in simpler, less technical terms. Focus on business value and user-facing features.',
  },
];

interface RegenerateFeedbackProps {
  onRegenerate: (feedback?: string) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
  itemType: 'epics' | 'features' | 'user stories' | 'tasks';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const RegenerateFeedback: React.FC<RegenerateFeedbackProps> = ({
  onRegenerate,
  isLoading = false,
  isReadOnly = false,
  itemType,
  variant = 'default',
  size = 'default',
}) => {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customFeedback, setCustomFeedback] = useState('');
  const isDisabled = isLoading || isReadOnly;

  const handleFeedbackSelect = (option: FeedbackOption) => {
    const contextPrompt = `${option.prompt}\n\nApply this guidance when generating the ${itemType}.`;
    onRegenerate(contextPrompt);
  };

  const handleCustomSubmit = () => {
    if (customFeedback.trim()) {
      const contextPrompt = `User feedback: ${customFeedback.trim()}\n\nApply this guidance when generating the ${itemType}.`;
      onRegenerate(contextPrompt);
      setCustomFeedback('');
      setIsCustomDialogOpen(false);
    }
  };

  const handleSimpleRegenerate = () => {
    onRegenerate();
  };

  return (
    <>
      <div className="inline-flex rounded-md shadow-sm">
        <Button
          variant={variant}
          size={size}
          onClick={handleSimpleRegenerate}
          disabled={isDisabled}
          className="rounded-r-none"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Generate {itemType}
        </Button>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isDisabled}
            className="rounded-l-none border-l-0 px-2"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {feedbackOptions.map((option) => (
            <DropdownMenuItem
              key={option.type}
              onClick={() => handleFeedbackSelect(option)}
              className="cursor-pointer"
              disabled={isDisabled}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsCustomDialogOpen(true)}
            className="cursor-pointer"
            disabled={isDisabled}
          >
            Custom feedback...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>

      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Regeneration Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="custom-feedback">
                Describe how you&apos;d like the {itemType} to be different
              </Label>
              <Textarea
                id="custom-feedback"
                placeholder={`e.g., "Focus on mobile-first approach" or "Include more security considerations"`}
                value={customFeedback}
                onChange={(e) => setCustomFeedback(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomSubmit}
              disabled={!customFeedback.trim() || isReadOnly}
            >
              Regenerate with Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegenerateFeedback;
