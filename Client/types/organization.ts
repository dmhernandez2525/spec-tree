export interface Organization {
  id: string;
  name: string;
  size: OrganizationSize;
  industry: Industry;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  description?: string;
  websiteUrl?: string;
  avatarUrl?: string;
  aiGenerationQuota?: number;
  aiGenerationUsage?: number;
}

export type OrganizationSize =
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1001+';

export type Industry =
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'manufacturing'
  | 'retail'
  | 'other';

export type OrganizationRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'member'
  | 'viewer';

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  joinedAt: string;
}

export interface OrganizationInvite {
  id: string;
  email: string;
  organizationId: string;
  role: OrganizationRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedById: string;
  message?: string;
  createdAt: string;
  expiresAt: string;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  plan: 'free' | 'pro' | 'enterprise';
  seats: number;
  usedSeats: number;
  pricePerSeat: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
}

export type TeamActivityType =
  | 'edit'
  | 'comment'
  | 'generation'
  | 'invite'
  | 'member_change'
  | 'permission_change'
  | 'template'
  | 'api_key'
  | 'quota'
  | 'settings';

export interface TeamActivity {
  id: string;
  type: TeamActivityType;
  actorId: string;
  actorName: string;
  target: string;
  metadata: Record<string, unknown>;
  happenedAt: string;
}

export type AuditLogAction =
  | 'permission_change'
  | 'member_added'
  | 'member_removed'
  | 'invite_sent'
  | 'invite_accepted'
  | 'invite_declined'
  | 'quota_updated'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'settings_updated'
  | 'template_created';

export interface AuditLogEntry {
  id: string;
  action: AuditLogAction;
  actorId: string;
  actorName: string;
  targetId: string;
  targetType: string;
  metadata: Record<string, unknown>;
  happenedAt: string;
}

export type AIProvider = 'openai' | 'anthropic' | 'gemini';

export interface WorkspaceAPIKey {
  id: string;
  provider: AIProvider;
  label: string;
  maskedKey: string;
  isActive: boolean;
  createdById: string;
  lastUsedAt: string | null;
}

export interface SharedTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: Record<string, unknown>;
  createdById: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface QuotaInfo {
  monthlyLimit: number;
  currentUsage: number;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  role: OrganizationRole;
  avatarUrl?: string;
}

export interface OrganizationState {
  currentOrganization: Organization | null;
  members: OrganizationMember[];
  invites: OrganizationInvite[];
  subscription: OrganizationSubscription | null;
  isLoading: boolean;
  error: string | null;
}
