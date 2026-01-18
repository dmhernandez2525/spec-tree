import { describe, it, expect } from 'vitest';
import { ScrollArea, ScrollBar } from './scroll-area';

describe('ScrollArea exports', () => {
  it('exports ScrollArea component', () => {
    expect(ScrollArea).toBeDefined();
    expect(ScrollArea.displayName).toBe('ScrollArea');
  });

  it('exports ScrollBar component', () => {
    expect(ScrollBar).toBeDefined();
    expect(ScrollBar.displayName).toBe('ScrollAreaScrollbar');
  });
});
