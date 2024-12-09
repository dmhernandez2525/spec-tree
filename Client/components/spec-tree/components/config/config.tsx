import React from 'react';
import { useDispatch } from 'react-redux';
import { updateSelectedModel } from '../../../../lib/store/sow-slice';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, Cpu } from 'lucide-react';

interface ModelOption {
  name: string;
  module: string;
  description: string;
  features: string[];
  pricing: string;
}

const Config: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useDispatch();

  const models: ModelOption[] = [
    {
      name: 'GPT-4 Turbo',
      module: 'gpt-4-turbo-preview',
      description: 'Latest high-intelligence model with improved capabilities',
      features: [
        'Text and image input, text output',
        '128k context length',
        'Input: $10 | Output: $30*',
      ],
      pricing: 'prices per 1 million tokens*',
    },
    {
      name: 'GPT-3.5 Turbo',
      module: 'gpt-3.5-turbo-16k',
      description: 'Fast, cost-effective model for everyday tasks',
      features: [
        'Text input, text output',
        '16k context length',
        'Input: $0.50 | Output: $1.50*',
      ],
      pricing: 'prices per 1 million tokens*',
    },
  ];

  const handleSelectModel = async (module: string) => {
    setIsLoading(true);
    setError(null);
    try {
      dispatch(updateSelectedModel(module));
      setIsOpen(false);
    } catch (err) {
      console.error(`Failed to update model selection: ${err}`);
      setError('Failed to update model selection');
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
        <Cpu className="mr-2 h-4 w-4" />
        Configure Model
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select AI Model</DialogTitle>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <Card
                key={model.module}
                className="transition-all hover:shadow-lg cursor-pointer"
                onClick={() => !isLoading && handleSelectModel(model.module)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {model.name}
                    <Badge variant="secondary">{model.pricing}</Badge>
                  </CardTitle>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {model.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={isLoading}
                  >
                    Select Model
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Config;
