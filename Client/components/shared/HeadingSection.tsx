interface HeadingSectionProps {
  heading?: string;
  description?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
  textColor?: string;
}

export function HeadingSection({
  heading,
  description,
  className,
  align = 'center',
  textColor,
}: HeadingSectionProps) {
  return (
    <div
      className={`space-y-4 ${
        align === 'center'
          ? 'text-center'
          : align === 'right'
          ? 'text-right'
          : 'text-left'
      } ${className}`}
    >
      {heading && (
        <h1
          className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
          style={textColor ? { color: textColor } : undefined}
        >
          {heading}
        </h1>
      )}
      {description && (
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          {description}
        </p>
      )}
    </div>
  );
}
