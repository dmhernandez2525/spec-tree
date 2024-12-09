import React from 'react';

const ScrollableCode = ({ content }: { content: string }) => {
  return (
    <div className="relative">
      <pre className="max-h-[300px] overflow-auto rounded-lg bg-muted p-4 font-mono text-sm">
        <code className="block whitespace-pre overflow-x-auto text-muted-foreground">
          {content}
        </code>
      </pre>
    </div>
  );
};

export default ScrollableCode;
