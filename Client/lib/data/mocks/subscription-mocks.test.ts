import { describe, it, expect } from 'vitest';
import {
  mockSubscriptions,
  mockBillingHistory,
  BillingHistoryItem,
} from './subscription-mocks';

describe('subscription-mocks', () => {
  describe('mockSubscriptions', () => {
    it('exports mockSubscriptions object', () => {
      expect(mockSubscriptions).toBeDefined();
      expect(typeof mockSubscriptions).toBe('object');
    });

    it('contains free tier subscription', () => {
      expect(mockSubscriptions.freeTier).toBeDefined();
      expect(mockSubscriptions.freeTier.plan).toBe('free');
      expect(mockSubscriptions.freeTier.pricePerSeat).toBe(0);
    });

    it('contains pro plan subscription', () => {
      expect(mockSubscriptions.proPlan).toBeDefined();
      expect(mockSubscriptions.proPlan.plan).toBe('pro');
      expect(mockSubscriptions.proPlan.status).toBe('active');
    });

    it('contains enterprise subscription', () => {
      expect(mockSubscriptions.enterprise).toBeDefined();
      expect(mockSubscriptions.enterprise.plan).toBe('enterprise');
      expect(mockSubscriptions.enterprise.billingCycle).toBe('yearly');
    });

    it('contains past due subscription', () => {
      expect(mockSubscriptions.pastDue).toBeDefined();
      expect(mockSubscriptions.pastDue.status).toBe('past_due');
    });

    it('contains canceled subscription', () => {
      expect(mockSubscriptions.canceled).toBeDefined();
      expect(mockSubscriptions.canceled.status).toBe('canceled');
    });

    it('contains trial subscription', () => {
      expect(mockSubscriptions.trial).toBeDefined();
    });

    it('each subscription has required properties', () => {
      Object.values(mockSubscriptions).forEach((subscription) => {
        expect(subscription.id).toBeDefined();
        expect(subscription.organizationId).toBeDefined();
        expect(subscription.plan).toBeDefined();
        expect(subscription.seats).toBeDefined();
        expect(typeof subscription.seats).toBe('number');
        expect(subscription.usedSeats).toBeDefined();
        expect(typeof subscription.usedSeats).toBe('number');
        expect(subscription.pricePerSeat).toBeDefined();
        expect(subscription.billingCycle).toBeDefined();
        expect(subscription.status).toBeDefined();
        expect(subscription.currentPeriodEnd).toBeDefined();
      });
    });

    it('used seats is always less than or equal to seats', () => {
      Object.values(mockSubscriptions).forEach((subscription) => {
        expect(subscription.usedSeats).toBeLessThanOrEqual(subscription.seats);
      });
    });
  });

  describe('mockBillingHistory', () => {
    it('exports mockBillingHistory object', () => {
      expect(mockBillingHistory).toBeDefined();
      expect(typeof mockBillingHistory).toBe('object');
    });

    it('contains regular billing history', () => {
      expect(mockBillingHistory.regular).toBeDefined();
      expect(Array.isArray(mockBillingHistory.regular)).toBe(true);
      expect(mockBillingHistory.regular.length).toBeGreaterThan(0);
    });

    it('each billing history item has required properties', () => {
      Object.values(mockBillingHistory).forEach((history) => {
        history.forEach((item: BillingHistoryItem) => {
          expect(item.id).toBeDefined();
          expect(item.date).toBeDefined();
          expect(item.amount).toBeDefined();
          expect(typeof item.amount).toBe('number');
          expect(item.status).toBeDefined();
          expect(['paid', 'pending', 'failed']).toContain(item.status);
          expect(item.description).toBeDefined();
        });
      });
    });
  });
});
