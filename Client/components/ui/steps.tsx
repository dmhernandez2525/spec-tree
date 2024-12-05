import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

interface StepsHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface StepsItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: number;
  title: string;
}

interface StepsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

const StepsContext = React.createContext<number>(0);

const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ value, children, className, ...props }, ref) => {
    return (
      <StepsContext.Provider value={value}>
        <div ref={ref} className={cn('space-y-4', className)} {...props}>
          {children}
        </div>
      </StepsContext.Provider>
    );
  }
);
Steps.displayName = 'Steps';

const StepsHeader = React.forwardRef<HTMLDivElement, StepsHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full justify-between',
          'before:absolute before:left-0 before:top-[15px] before:h-[2px] before:w-full before:bg-muted',
          className
        )}
        {...props}
      />
    );
  }
);
StepsHeader.displayName = 'StepsHeader';

const StepsItem = React.forwardRef<HTMLButtonElement, StepsItemProps>(
  ({ value, title, className, disabled, onClick, ...props }, ref) => {
    const steps = React.useContext(StepsContext);
    const isActive = steps === value;
    const isComplete = steps > value;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'relative z-10 flex flex-col items-center gap-2',
          'min-w-[100px]',
          className
        )}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background text-sm font-medium',
            isActive && 'border-primary text-primary',
            isComplete && 'border-primary bg-primary text-primary-foreground',
            !isActive &&
              !isComplete &&
              'border-muted-foreground text-muted-foreground',
            disabled && 'opacity-50'
          )}
        >
          {isComplete ? <Check className="h-4 w-4" /> : value + 1}
        </span>
        <span
          className={cn(
            'text-center text-sm font-medium',
            isActive && 'text-primary',
            isComplete && 'text-primary',
            !isActive && !isComplete && 'text-muted-foreground',
            disabled && 'opacity-50'
          )}
        >
          {title}
        </span>
      </button>
    );
  }
);
StepsItem.displayName = 'StepsItem';

const StepsContent = React.forwardRef<HTMLDivElement, StepsContentProps>(
  ({ value, children, className, ...props }, ref) => {
    const steps = React.useContext(StepsContext);
    const isActive = steps === value;

    if (!isActive) return null;

    return (
      <div ref={ref} className={cn('mt-4 space-y-4', className)} {...props}>
        {children}
      </div>
    );
  }
);
StepsContent.displayName = 'StepsContent';

export { Steps, StepsHeader, StepsItem, StepsContent };
