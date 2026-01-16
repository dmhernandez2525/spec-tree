import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSow } from '../../../../lib/store/sow-slice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { strapiService } from '../../lib/api/strapi-service';
import { logger } from '@/lib/logger';

interface SowInputProps {
  selectedApp: string | null;
}

const SowInput: React.FC<SowInputProps> = ({ selectedApp }) => {
  const [sowInput, setSowInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (selectedApp) {
        setIsLoading(true);
        try {
          const data = await strapiService.fetchAppById(selectedApp);
          logger.log('Fetched data:', data);
        } catch (err) {
          setError('Failed to fetch application data');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [selectedApp]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate JSON format
      const parsedSow = JSON.parse(sowInput);
      dispatch(setSow(parsedSow));
      setSowInput('');
    } catch (err) {
      console.error(`Failed to parse JSON: ${err}`);
      setError('Invalid JSON format. Please check your input.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="import">
        <AccordionTrigger className="text-base">
          Import Statement of Work
        </AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Textarea
                  value={sowInput}
                  onChange={(e) => setSowInput(e.target.value)}
                  placeholder="Paste your SOW JSON here..."
                  className="min-h-[200px] font-mono"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  disabled={isLoading || !sowInput.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import SOW
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SowInput;
