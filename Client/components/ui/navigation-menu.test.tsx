import { describe, it, expect } from 'vitest';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from './navigation-menu';

describe('NavigationMenu exports', () => {
  it('exports NavigationMenu component', () => {
    expect(NavigationMenu).toBeDefined();
    expect(NavigationMenu.displayName).toBe('NavigationMenu');
  });

  it('exports NavigationMenuList component', () => {
    expect(NavigationMenuList).toBeDefined();
    expect(NavigationMenuList.displayName).toBe('NavigationMenuList');
  });

  it('exports NavigationMenuItem component', () => {
    expect(NavigationMenuItem).toBeDefined();
  });

  it('exports NavigationMenuContent component', () => {
    expect(NavigationMenuContent).toBeDefined();
    expect(NavigationMenuContent.displayName).toBe('NavigationMenuContent');
  });

  it('exports NavigationMenuTrigger component', () => {
    expect(NavigationMenuTrigger).toBeDefined();
    expect(NavigationMenuTrigger.displayName).toBe('NavigationMenuTrigger');
  });

  it('exports NavigationMenuLink component', () => {
    expect(NavigationMenuLink).toBeDefined();
  });

  it('exports NavigationMenuIndicator component', () => {
    expect(NavigationMenuIndicator).toBeDefined();
    expect(NavigationMenuIndicator.displayName).toBe('NavigationMenuIndicator');
  });

  it('exports NavigationMenuViewport component', () => {
    expect(NavigationMenuViewport).toBeDefined();
    expect(NavigationMenuViewport.displayName).toBe('NavigationMenuViewport');
  });

  it('exports navigationMenuTriggerStyle utility', () => {
    expect(navigationMenuTriggerStyle).toBeDefined();
    expect(typeof navigationMenuTriggerStyle).toBe('function');
    const styles = navigationMenuTriggerStyle();
    expect(typeof styles).toBe('string');
  });
});
