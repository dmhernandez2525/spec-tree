import { describe, it, expect } from 'vitest';
import { RadioGroup, RadioGroupItem } from './radio-group';

describe('RadioGroup exports', () => {
  it('exports RadioGroup component', () => {
    expect(RadioGroup).toBeDefined();
    expect(RadioGroup.displayName).toBe('RadioGroup');
  });

  it('exports RadioGroupItem component', () => {
    expect(RadioGroupItem).toBeDefined();
    expect(RadioGroupItem.displayName).toBe('RadioGroupItem');
  });
});
