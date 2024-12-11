import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Icons } from '@/components/shared/icons';
import React from 'react';

interface AIProvider {
  id: string;
  name: string;
  description: string;
  models: AIModel[];
  icon: keyof typeof Icons;
  apiKeyInstructions: string;
  apiKeyUrl: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  pricePerToken: number;
  contextWindow: number;
  capabilities: string[];
}

const aiProviders: AIProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Advanced AI models with strong safety features',
    icon: 'brain',
    apiKeyInstructions: 'Get your API key from the Anthropic Console',
    apiKeyUrl: 'https://console.anthropic.com/',
    models: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        description: 'Most powerful model for complex tasks',
        pricePerToken: 0.00015,
        contextWindow: 200000,
        capabilities: ['Analysis', 'Code Generation', 'Creative Writing'],
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: 'Balanced performance and cost',
        pricePerToken: 0.00007,
        contextWindow: 200000,
        capabilities: ['Analysis', 'Code Generation', 'Creative Writing'],
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Wide range of AI models and capabilities',
    icon: 'openai',
    apiKeyInstructions: 'Get your API key from the OpenAI platform',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    models: [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Advanced reasoning and comprehension',
        pricePerToken: 0.00012,
        contextWindow: 128000,
        capabilities: ['Analysis', 'Code Generation', 'Creative Writing'],
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective',
        pricePerToken: 0.00001,
        contextWindow: 16000,
        capabilities: ['Analysis', 'Code Generation', 'Creative Writing'],
      },
    ],
  },
];

const aiSettingsSchema = z.object({
  useOwnKeys: z.boolean(),
  defaultProvider: z.string(),
  defaultModel: z.string(),
  apiKeys: z.record(z.string()),
  settings: z.object({
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().min(100).max(4000),
    frequencyPenalty: z.number().min(0).max(2),
    presencePenalty: z.number().min(0).max(2),
  }),
});

type AISettingsFormData = z.infer<typeof aiSettingsSchema>;

export function AISettings() {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(
    aiProviders[0]
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<AISettingsFormData>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      useOwnKeys: false,
      defaultProvider: 'anthropic',
      defaultModel: 'claude-3-sonnet',
      apiKeys: {},
      settings: {
        temperature: 0.7,
        maxTokens: 2000,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
      },
    },
  });

  async function onSubmit(data: AISettingsFormData) {
    // TODO: Remove console.log
    console.log(data);
    setIsUpdating(true);
    try {
      // TODO: Implement API call to update AI settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('AI settings updated successfully');
    } catch (error) {
      console.log(`Failed to update AI settings: ${error}`);
      toast.error('Failed to update AI settings');
    } finally {
      setIsUpdating(false);
    }
  }

  const handleProviderChange = (providerId: string) => {
    const provider = aiProviders.find((p) => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      form.setValue('defaultModel', provider.models[0].id);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
            <CardDescription>
              Configure AI providers and model settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="useOwnKeys"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Use Own API Keys
                    </FormLabel>
                    <FormDescription>
                      Get a 20% discount on AI usage by using your own API keys
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="defaultProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default AI Provider</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleProviderChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aiProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            <div className="flex items-center gap-2">
                              {React.createElement(Icons[provider.icon], {
                                className: 'h-4 w-4',
                              })}
                              <span>{provider.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your preferred AI provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedProvider.models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col gap-1">
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ${model.pricePerToken}/token
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your default AI model
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch('useOwnKeys') && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Keys</h3>
                {aiProviders.map((provider) => (
                  <FormField
                    key={provider.id}
                    control={form.control}
                    name={`apiKeys.${provider.id}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          {React.createElement(Icons[provider.icon], {
                            className: 'h-4 w-4',
                          })}
                          {provider.name} API Key
                          <a
                            href={provider.apiKeyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2"
                          >
                            <Icons.externalLink className="h-4 w-4" />
                          </a>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={`Enter your ${provider.name} API key`}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {provider.apiKeyInstructions}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Model Settings</h3>
              <FormField
                control={form.control}
                name="settings.temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{field.value}</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Controls randomness in the output (0 = deterministic, 2 =
                      very random)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="settings.maxTokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Slider
                          min={100}
                          max={4000}
                          step={100}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          className="flex-1"
                        />
                        <span className="w-16 text-right">{field.value}</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Maximum number of tokens to generate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset to Defaults
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
