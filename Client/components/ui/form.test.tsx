import { describe, it, expect } from 'vitest';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from './form';

describe('Form', () => {
  it('exports all form components', () => {
    expect(Form).toBeDefined();
    expect(FormField).toBeDefined();
    expect(FormItem).toBeDefined();
    expect(FormLabel).toBeDefined();
    expect(FormControl).toBeDefined();
    expect(FormDescription).toBeDefined();
    expect(FormMessage).toBeDefined();
    expect(useFormField).toBeDefined();
  });
});
