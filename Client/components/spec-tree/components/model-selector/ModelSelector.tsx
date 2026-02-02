/**
 * Model Selector Component
 *
 * F1.3.9 - Model selection per task
 *
 * UI component for selecting AI models per task type.
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cpu, RotateCcw, Sparkles, HelpCircle, MessageSquare, Zap, RefreshCw } from 'lucide-react';
import {
  useModelSelection,
  TaskType,
  getTaskTypeDescription,
  getTaskTypeDisplayName,
} from '../../lib/hooks/useModelSelection';
import { AIModelInfo, AIProviderType } from '../../lib/api/providers/ai-provider';

interface ModelSelectorProps {
  /** Show only a specific task type selector */
  taskType?: TaskType;
  /** Callback when model changes */
  onModelChange?: (taskType: TaskType, modelId: string) => void;
  /** Compact mode for inline display */
  compact?: boolean;
  /** Class name for styling */
  className?: string;
}

/**
 * Get icon for task type
 */
function getTaskTypeIcon(taskType: TaskType) {
  switch (taskType) {
    case 'generation':
      return <Sparkles className="h-4 w-4" />;
    case 'expansion':
      return <Zap className="h-4 w-4" />;
    case 'questions':
      return <HelpCircle className="h-4 w-4" />;
    case 'refinement':
      return <RefreshCw className="h-4 w-4" />;
    case 'chat':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Cpu className="h-4 w-4" />;
  }
}

/**
 * Get provider display name and color
 */
function getProviderInfo(provider: AIProviderType): { name: string; color: string } {
  switch (provider) {
    case 'openai':
      return { name: 'OpenAI', color: 'bg-green-100 text-green-800' };
    case 'anthropic':
      return { name: 'Anthropic', color: 'bg-orange-100 text-orange-800' };
    case 'gemini':
      return { name: 'Google', color: 'bg-blue-100 text-blue-800' };
    default:
      return { name: provider, color: 'bg-gray-100 text-gray-800' };
  }
}

/**
 * Format context window size
 */
function formatContextWindow(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  return `${(tokens / 1000).toFixed(0)}K`;
}

/**
 * Single task type model selector
 */
function TaskModelSelector({
  taskType,
  currentModel,
  modelsByProvider,
  onSelect,
  showDescription = true,
}: {
  taskType: TaskType;
  currentModel: string;
  modelsByProvider: Record<AIProviderType, AIModelInfo[]>;
  onSelect: (modelId: string) => void;
  showDescription?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {getTaskTypeIcon(taskType)}
        <span className="font-medium">{getTaskTypeDisplayName(taskType)}</span>
      </div>
      {showDescription && (
        <p className="text-sm text-muted-foreground">
          {getTaskTypeDescription(taskType)}
        </p>
      )}
      <Select value={currentModel} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {(['openai', 'anthropic', 'gemini'] as AIProviderType[]).map((provider) => {
            const models = modelsByProvider[provider];
            if (!models || models.length === 0) return null;
            const { name } = getProviderInfo(provider);

            return (
              <SelectGroup key={provider}>
                <SelectLabel>{name}</SelectLabel>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatContextWindow(model.contextWindow)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Compact inline model selector for a single task type
 */
function CompactModelSelector({
  currentModel,
  modelsByProvider,
  onSelect,
}: {
  currentModel: string;
  modelsByProvider: Record<AIProviderType, AIModelInfo[]>;
  onSelect: (modelId: string) => void;
}) {
  const currentModelInfo = useMemo(() => {
    for (const models of Object.values(modelsByProvider)) {
      const model = models.find((m) => m.id === currentModel);
      if (model) return model;
    }
    return null;
  }, [currentModel, modelsByProvider]);

  return (
    <Select value={currentModel} onValueChange={onSelect}>
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          <SelectValue>
            {currentModelInfo?.name || 'Select model'}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {(['openai', 'anthropic', 'gemini'] as AIProviderType[]).map((provider) => {
          const models = modelsByProvider[provider];
          if (!models || models.length === 0) return null;
          const { name } = getProviderInfo(provider);

          return (
            <SelectGroup key={provider}>
              <SelectLabel>{name}</SelectLabel>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}

/**
 * Full model configuration dialog
 */
function ModelConfigDialog({
  isOpen,
  onClose,
  preferences,
  modelsByProvider,
  onModelChange,
  onReset,
}: {
  isOpen: boolean;
  onClose: () => void;
  preferences: Record<TaskType, string>;
  modelsByProvider: Record<AIProviderType, AIModelInfo[]>;
  onModelChange: (taskType: TaskType, modelId: string) => void;
  onReset: () => void;
}) {
  const taskTypes: TaskType[] = ['generation', 'expansion', 'questions', 'refinement', 'chat'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Model Configuration
          </DialogTitle>
          <DialogDescription>
            Configure which AI model to use for different types of tasks.
            Higher capability models produce better results but cost more.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="by-task" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="by-task">By Task Type</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="by-task" className="space-y-4 mt-4">
            {taskTypes.map((taskType) => (
              <Card key={taskType}>
                <CardContent className="pt-4">
                  <TaskModelSelector
                    taskType={taskType}
                    currentModel={preferences[taskType]}
                    modelsByProvider={modelsByProvider}
                    onSelect={(modelId) => onModelChange(taskType, modelId)}
                  />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="overview" className="mt-4">
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Each task type can use a different model. Use high-capability models
                  (GPT-4, Claude Opus) for complex generation and refinement.
                  Use faster models (GPT-3.5, Haiku, Flash) for questions and chat.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {(['openai', 'anthropic', 'gemini'] as AIProviderType[]).map((provider) => {
                  const models = modelsByProvider[provider];
                  if (!models || models.length === 0) return null;
                  const { name, color } = getProviderInfo(provider);

                  return (
                    <Card key={provider}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Badge className={color}>{name}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {models.map((model) => (
                            <div
                              key={model.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{model.name}</span>
                              <Badge variant="outline">
                                {formatContextWindow(model.contextWindow)} context
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Model Selector Component
 *
 * Provides UI for selecting AI models per task type.
 */
export function ModelSelector({
  taskType,
  onModelChange,
  compact = false,
  className = '',
}: ModelSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    preferences,
    setModelForTask,
    resetPreferences,
    modelsByProvider,
  } = useModelSelection();

  const handleModelChange = (task: TaskType, modelId: string) => {
    setModelForTask(task, modelId);
    onModelChange?.(task, modelId);
  };

  // Single task type selector (compact or full)
  if (taskType) {
    if (compact) {
      return (
        <div className={className}>
          <CompactModelSelector
            currentModel={preferences[taskType]}
            modelsByProvider={modelsByProvider}
            onSelect={(modelId) => handleModelChange(taskType, modelId)}
          />
        </div>
      );
    }

    return (
      <div className={className}>
        <TaskModelSelector
          taskType={taskType}
          currentModel={preferences[taskType]}
          modelsByProvider={modelsByProvider}
          onSelect={(modelId) => handleModelChange(taskType, modelId)}
        />
      </div>
    );
  }

  // Full configuration button + dialog
  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
      >
        <Cpu className="h-4 w-4 mr-2" />
        Configure Models
      </Button>

      <ModelConfigDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        preferences={preferences}
        modelsByProvider={modelsByProvider}
        onModelChange={handleModelChange}
        onReset={resetPreferences}
      />
    </div>
  );
}

export default ModelSelector;
