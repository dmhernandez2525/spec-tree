/**
 * Multi-Tenant Enterprise Management
 *
 * Provides tenant creation, plan-based resource limits, plan upgrades,
 * and slug validation for the SpecTree multi-tenant architecture.
 */

export type Plan = 'free' | 'pro' | 'enterprise';

export interface TenantSettings {
  maxUsers: number;
  maxProjects: number;
  customBranding: boolean;
  ssoEnabled: boolean;
  auditLogEnabled: boolean;
  apiRateLimit: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  settings: TenantSettings;
  createdAt: string;
}

export interface PlanLimitCheck {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
}

/**
 * Resource limits and feature flags for each subscription plan.
 * A value of -1 for numeric limits indicates unlimited usage.
 */
export const PLAN_LIMITS: Record<Plan, TenantSettings> = {
  free: {
    maxUsers: 3,
    maxProjects: 5,
    customBranding: false,
    ssoEnabled: false,
    auditLogEnabled: false,
    apiRateLimit: 100,
  },
  pro: {
    maxUsers: 25,
    maxProjects: 50,
    customBranding: true,
    ssoEnabled: false,
    auditLogEnabled: true,
    apiRateLimit: 1000,
  },
  enterprise: {
    maxUsers: -1,
    maxProjects: -1,
    customBranding: true,
    ssoEnabled: true,
    auditLogEnabled: true,
    apiRateLimit: 10000,
  },
} as const;

/**
 * Derive a URL-safe slug from a tenant name.
 * Converts to lowercase, replaces spaces and non-alphanumeric runs
 * with hyphens, and trims leading/trailing hyphens.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a simple unique identifier.
 * Uses crypto.randomUUID when available, with a fallback
 * based on timestamp and random values.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tenant-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a new tenant with the given name and subscription plan.
 * Automatically generates a slug from the name and applies the
 * corresponding plan limits.
 */
export function createTenant(name: string, plan: Plan = 'free'): Tenant {
  const slug = slugify(name);
  const settings = { ...PLAN_LIMITS[plan] };

  return {
    id: generateId(),
    name,
    slug,
    plan,
    settings,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Check whether a resource limit allows additional usage for a tenant.
 *
 * @param tenant - The tenant to check limits for
 * @param resource - The settings key to check ('maxUsers' or 'maxProjects')
 * @param currentCount - The current usage count
 * @returns An object indicating whether the action is allowed, the limit,
 *          current usage, and remaining capacity
 */
export function checkPlanLimit(
  tenant: Tenant,
  resource: 'maxUsers' | 'maxProjects',
  currentCount: number,
): PlanLimitCheck {
  const limit = tenant.settings[resource];

  // -1 means unlimited
  if (limit === -1) {
    return {
      allowed: true,
      limit: -1,
      current: currentCount,
      remaining: -1,
    };
  }

  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed: currentCount < limit,
    limit,
    current: currentCount,
    remaining,
  };
}

/**
 * Upgrade a tenant to a new subscription plan.
 * Returns a new tenant object with updated plan and settings.
 * The new plan must be different from the current plan.
 */
export function upgradePlan(tenant: Tenant, newPlan: Plan): Tenant {
  if (tenant.plan === newPlan) {
    return { ...tenant };
  }

  return {
    ...tenant,
    plan: newPlan,
    settings: { ...PLAN_LIMITS[newPlan] },
  };
}

/**
 * Validate a tenant slug format.
 * Valid slugs are 3-50 characters long, contain only lowercase
 * letters, numbers, and hyphens, and do not start or end with a hyphen.
 */
export function validateTenantSlug(slug: string): { valid: boolean; error?: string } {
  if (slug.length < 3) {
    return { valid: false, error: 'Slug must be at least 3 characters long' };
  }

  if (slug.length > 50) {
    return { valid: false, error: 'Slug must be at most 50 characters long' };
  }

  if (slug !== slug.toLowerCase()) {
    return { valid: false, error: 'Slug must be lowercase' };
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && slug.length >= 3) {
    if (/^-/.test(slug) || /-$/.test(slug)) {
      return { valid: false, error: 'Slug must not start or end with a hyphen' };
    }
    if (/[^a-z0-9-]/.test(slug)) {
      return { valid: false, error: 'Slug may only contain lowercase letters, numbers, and hyphens' };
    }
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return { valid: false, error: 'Slug format is invalid' };
  }

  return { valid: true };
}
