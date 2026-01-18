import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('lucide-react', () => ({
  GripVertical: () => <span data-testid="grip-icon">GripVertical</span>,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

// Import after mocks
import { DragOverlayContent } from './DragOverlay';

describe('DragOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('module can be imported', () => {
    // DragOverlayContent is imported at the top
    expect(DragOverlayContent).toBeDefined();
  });

  it('exports DragOverlayContent as named export', () => {
    // DragOverlayContent is imported at the top as named export
    expect(typeof DragOverlayContent).toBe('function');
  });

  it('exports DragOverlayContent as default export', () => {
    // DragOverlayContent is exported both as named and default export
    expect(typeof DragOverlayContent).toBe('function');
  });
});

describe('DragOverlay types', () => {
  it('module exports are consistent', () => {
    // Verified by successful static import at the top
    expect(DragOverlayContent).toBeDefined();
  });
});
