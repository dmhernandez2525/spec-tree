import { describe, it, expect, vi } from 'vitest';
import { styleFonts, fontClasses, FontProvider, useFonts } from './FontManager';

// Mock next/font/google
vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-inter' }),
  Space_Mono: () => ({ variable: '--font-space-mono' }),
  Press_Start_2P: () => ({ variable: '--font-press-start' }),
  Roboto_Mono: () => ({ variable: '--font-roboto-mono' }),
  Work_Sans: () => ({ variable: '--font-work-sans' }),
}));

describe('FontManager', () => {
  describe('styleFonts export', () => {
    it('exports styleFonts object', () => {
      expect(styleFonts).toBeDefined();
      expect(typeof styleFonts).toBe('object');
    });

    it('has default style', () => {
      expect(styleFonts.default).toBeDefined();
      expect(styleFonts.default.heading).toBe('font-work-sans');
      expect(styleFonts.default.body).toBe('font-inter');
    });

    it('has cyberpunk style', () => {
      expect(styleFonts.cyberpunk).toBeDefined();
      expect(styleFonts.cyberpunk.heading).toBe('font-space-mono');
      expect(styleFonts.cyberpunk.body).toBe('font-roboto-mono');
    });

    it('has retro style', () => {
      expect(styleFonts.retro).toBeDefined();
      expect(styleFonts.retro.heading).toBe('font-press-start');
      expect(styleFonts.retro.body).toBe('font-press-start');
    });

    it('has new-york style', () => {
      expect(styleFonts['new-york']).toBeDefined();
      expect(styleFonts['new-york'].heading).toBe('font-inter');
      expect(styleFonts['new-york'].body).toBe('font-inter');
    });

    it('has glassmorphic style', () => {
      expect(styleFonts.glassmorphic).toBeDefined();
    });

    it('has brutalist style', () => {
      expect(styleFonts.brutalist).toBeDefined();
    });

    it('has neumorphic style', () => {
      expect(styleFonts.neumorphic).toBeDefined();
    });

    it('has kawaii style', () => {
      expect(styleFonts.kawaii).toBeDefined();
    });

    it('has terminal style', () => {
      expect(styleFonts.terminal).toBeDefined();
      expect(styleFonts.terminal.heading).toBe('font-space-mono');
      expect(styleFonts.terminal.body).toBe('font-space-mono');
    });

    it('has handdrawn style', () => {
      expect(styleFonts.handdrawn).toBeDefined();
    });

    it('has claymorphic style', () => {
      expect(styleFonts.claymorphic).toBeDefined();
    });

    it('has schematic style', () => {
      expect(styleFonts.schematic).toBeDefined();
    });
  });

  describe('fontClasses export', () => {
    it('exports fontClasses object', () => {
      expect(fontClasses).toBeDefined();
      expect(typeof fontClasses).toBe('object');
    });

    it('has font-inter class', () => {
      expect(fontClasses['font-inter']).toBeDefined();
    });

    it('has font-space-mono class', () => {
      expect(fontClasses['font-space-mono']).toBeDefined();
    });

    it('has font-press-start class', () => {
      expect(fontClasses['font-press-start']).toBeDefined();
    });

    it('has font-roboto-mono class', () => {
      expect(fontClasses['font-roboto-mono']).toBeDefined();
    });

    it('has font-work-sans class', () => {
      expect(fontClasses['font-work-sans']).toBeDefined();
    });
  });

  describe('FontProvider export', () => {
    it('exports FontProvider component', () => {
      expect(FontProvider).toBeDefined();
      expect(typeof FontProvider).toBe('function');
    });
  });

  describe('useFonts export', () => {
    it('exports useFonts hook', () => {
      expect(useFonts).toBeDefined();
      expect(typeof useFonts).toBe('function');
    });
  });
});
