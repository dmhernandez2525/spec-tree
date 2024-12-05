import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({
  size = 24,
  className,
}: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className={cn(
          'flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg',
          className
        )}
      >
        <Loader2 className="animate-spin text-primary" size={size} />
        <p className="text-sm font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
