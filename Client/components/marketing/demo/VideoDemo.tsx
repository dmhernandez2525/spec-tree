import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Maximize2, Volume2, VolumeX } from 'lucide-react';

interface VideoDemoProps {
  videoUrl: string;
  title: string;
  description: string;
  duration: string;
  chapters: {
    title: string;
    timestamp: string;
  }[];
}

export function VideoDemo({
  videoUrl,
  title,
  description,
  duration,
  chapters,
}: VideoDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="text-muted-foreground mt-2">{description}</p>
          </div>
          <Badge variant="secondary">{duration}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          {/* Video player would go here - using placeholder for demo */}
          <div className="absolute inset-0">
            <video
              src={videoUrl}
              className="h-full w-full object-cover"
              playsInline
              muted={isMuted}
            />
          </div>

          {/* Video controls overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-white/20 text-white hover:bg-white/30"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-white/20 text-white hover:bg-white/30"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-white/20 text-white hover:bg-white/30"
              >
                <Maximize2 className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Chapters</h3>
          <div className="grid gap-2">
            {chapters.map((chapter, index) => (
              <Button
                key={chapter.title}
                variant={activeChapter === index ? 'secondary' : 'ghost'}
                className="justify-between"
                onClick={() => setActiveChapter(index)}
              >
                <span>{chapter.title}</span>
                <span className="text-sm text-muted-foreground">
                  {chapter.timestamp}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
