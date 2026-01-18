import { describe, it, expect } from 'vitest';
import { pricingTiers, featureComparison } from './pricing';

describe('pricing data', () => {
  describe('pricingTiers', () => {
    it('exports pricingTiers array', () => {
      expect(Array.isArray(pricingTiers)).toBe(true);
      expect(pricingTiers.length).toBeGreaterThan(0);
    });

    it('each tier has required properties', () => {
      pricingTiers.forEach((tier) => {
        expect(tier.id).toBeDefined();
        expect(tier.name).toBeDefined();
        expect(tier.description).toBeDefined();
        expect(tier.price).toBeDefined();
        expect(tier.features).toBeDefined();
        expect(Array.isArray(tier.features)).toBe(true);
      });
    });

    it('each tier has valid price structure', () => {
      pricingTiers.forEach((tier) => {
        expect(typeof tier.price.monthly).toBe('number');
        expect(typeof tier.price.annual).toBe('number');
        expect(tier.price.annual).toBeLessThanOrEqual(tier.price.monthly);
      });
    });

    it('includes starter tier', () => {
      const starterTier = pricingTiers.find((tier) => tier.id === 'starter');
      expect(starterTier).toBeDefined();
      expect(starterTier?.name).toBe('Starter');
    });

    it('includes professional tier', () => {
      const proTier = pricingTiers.find((tier) => tier.id === 'professional');
      expect(proTier).toBeDefined();
      expect(proTier?.name).toBe('Professional');
    });

    it('includes enterprise tier', () => {
      const enterpriseTier = pricingTiers.find((tier) => tier.id === 'enterprise');
      expect(enterpriseTier).toBeDefined();
      expect(enterpriseTier?.name).toBe('Enterprise');
    });

    it('each feature has title and description', () => {
      pricingTiers.forEach((tier) => {
        tier.features.forEach((feature) => {
          expect(feature.title).toBeDefined();
          expect(feature.description).toBeDefined();
          expect(feature.included).toBeDefined();
        });
      });
    });
  });

  describe('featureComparison', () => {
    it('exports featureComparison array', () => {
      expect(Array.isArray(featureComparison)).toBe(true);
      expect(featureComparison.length).toBeGreaterThan(0);
    });

    it('each feature has required properties', () => {
      featureComparison.forEach((feature) => {
        expect(feature.name).toBeDefined();
        expect(feature.category).toBeDefined();
        expect(feature.plans).toBeDefined();
      });
    });

    it('each feature has plan information', () => {
      featureComparison.forEach((feature) => {
        expect(feature.plans.starter).toBeDefined();
        expect(feature.plans.professional).toBeDefined();
        expect(feature.plans.enterprise).toBeDefined();
      });
    });
  });
});
