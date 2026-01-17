'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TutorialTranscriptProps {
  tutorialId: string;
}

// _tutorialId reserved for fetching transcript from API
export function TutorialTranscript({ tutorialId: _tutorialId }: TutorialTranscriptProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {/* Example transcript content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">0:00</span>
                <p>Welcome to this Spec Tree tutorial.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">0:15</span>
                <p>
                  Today, we will be covering the basics of getting started with
                  the platform.
                </p>
              </div>
              {/* Add more transcript content as needed */}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
