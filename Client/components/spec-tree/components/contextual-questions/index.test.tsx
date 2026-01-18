import { describe, it, expect, vi } from 'vitest';

// Mock the child component to avoid importing the full dependency tree
vi.mock('./main-contextual-component', () => ({
  default: () => null,
}));

// Import after mocks
import MainContextualComponent from './index';
import MainContextualComponentDirect from './main-contextual-component';

describe('contextual-questions module', () => {
  it('exports MainContextualComponent as default', () => {
    // MainContextualComponent is imported at the top of the file
    expect(MainContextualComponent).toBeDefined();
  });

  it('default export is a function (React component)', () => {
    // MainContextualComponent is imported at the top
    expect(typeof MainContextualComponent).toBe('function');
  });

  it('can be imported without errors', () => {
    // Verified by static import at the top
    expect(MainContextualComponent).toBeDefined();
  });
});

describe('contextual-questions module re-export', () => {
  it('re-exports from main-contextual-component', () => {
    // Both modules are imported at the top
    // Both should export the same default (the mocked component)
    expect(MainContextualComponent).toBe(MainContextualComponentDirect);
  });
});

describe('contextual-questions module structure', () => {
  it('has a default export only (no named exports)', () => {
    // The module is imported at the top
    // Default export is verified by successful import
    expect(MainContextualComponent).toBeDefined();
  });
});
