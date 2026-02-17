import { describe, it, expect, beforeEach } from 'vitest';
import {
  isDemoMode,
  createDemoSession,
  getDemoStateForRole,
  DEMO_ROLES,
} from './demo-mode';
import {
  DEMO_USERS,
  DEMO_ORGANIZATION,
  DEMO_WORKSPACE,
  DEMO_EPICS,
  DEMO_FEATURES,
  DEMO_USER_STORIES,
  DEMO_TASKS,
} from './demo-data';

// ============================================================================
// isDemoMode
// ============================================================================

describe('isDemoMode', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
  });

  it('returns true when NEXT_PUBLIC_DEMO_MODE is "true"', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    expect(isDemoMode()).toBe(true);
  });

  it('returns false when NEXT_PUBLIC_DEMO_MODE is not set', () => {
    expect(isDemoMode()).toBe(false);
  });

  it('returns false when NEXT_PUBLIC_DEMO_MODE is "false"', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
    expect(isDemoMode()).toBe(false);
  });

  it('returns false when NEXT_PUBLIC_DEMO_MODE is an empty string', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = '';
    expect(isDemoMode()).toBe(false);
  });

  it('returns false when NEXT_PUBLIC_DEMO_MODE is "1"', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = '1';
    expect(isDemoMode()).toBe(false);
  });
});

// ============================================================================
// createDemoSession
// ============================================================================

describe('createDemoSession', () => {
  it('returns a session for the admin role', () => {
    const session = createDemoSession('admin');
    expect(session.role).toBe('admin');
    expect(session.userId).toBe('demo-admin');
    expect(session.user.name).toBe('Alex Demo');
  });

  it('returns a session for the editor role', () => {
    const session = createDemoSession('editor');
    expect(session.role).toBe('editor');
    expect(session.userId).toBe('demo-editor');
    expect(session.user.name).toBe('Jordan Demo');
  });

  it('returns a session for the viewer role', () => {
    const session = createDemoSession('viewer');
    expect(session.role).toBe('viewer');
    expect(session.userId).toBe('demo-viewer');
    expect(session.user.name).toBe('Sam Demo');
  });

  it('contains the correct user data in the session', () => {
    const session = createDemoSession('admin');
    expect(session.user).toEqual({
      id: 'demo-admin',
      email: 'admin@demo.example',
      name: 'Alex Demo',
      role: 'admin',
      avatarUrl: null,
    });
  });

  it('session userId matches the user object id', () => {
    for (const role of DEMO_ROLES) {
      const session = createDemoSession(role);
      expect(session.userId).toBe(session.user.id);
    }
  });
});

// ============================================================================
// getDemoStateForRole
// ============================================================================

describe('getDemoStateForRole', () => {
  it('returns state with epics populated', () => {
    const state = getDemoStateForRole('admin');
    const epicIds = Object.keys(state.sow.epics);
    expect(epicIds.length).toBe(2);
  });

  it('returns state with features populated', () => {
    const state = getDemoStateForRole('admin');
    const featureIds = Object.keys(state.sow.features);
    expect(featureIds.length).toBe(4);
  });

  it('returns state with user stories populated', () => {
    const state = getDemoStateForRole('admin');
    const storyIds = Object.keys(state.sow.userStories);
    expect(storyIds.length).toBe(8);
  });

  it('returns state with correct task count (16)', () => {
    const state = getDemoStateForRole('admin');
    const taskIds = Object.keys(state.sow.tasks);
    expect(taskIds.length).toBe(16);
  });

  it('epic IDs start with "demo-"', () => {
    const state = getDemoStateForRole('admin');
    for (const id of Object.keys(state.sow.epics)) {
      expect(id.startsWith('demo-')).toBe(true);
    }
  });

  it('all task IDs in state start with "demo-"', () => {
    const state = getDemoStateForRole('admin');
    for (const id of Object.keys(state.sow.tasks)) {
      expect(id.startsWith('demo-')).toBe(true);
    }
  });

  it('state has no loading flag set', () => {
    const state = getDemoStateForRole('admin');
    expect(state.sow.isLoading).toBe(false);
  });

  it('state has no error', () => {
    const state = getDemoStateForRole('admin');
    expect(state.sow.error).toBeNull();
  });

  it('state sow id references the demo app', () => {
    const state = getDemoStateForRole('viewer');
    expect(state.sow.id).toBe('demo-app-taskflow');
  });
});

// ============================================================================
// DEMO_USERS
// ============================================================================

describe('DEMO_USERS', () => {
  it('has exactly 3 users', () => {
    expect(DEMO_USERS).toHaveLength(3);
  });

  it('each user has a unique id', () => {
    const ids = DEMO_USERS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all emails use @demo.example domain', () => {
    for (const user of DEMO_USERS) {
      expect(user.email).toMatch(/@demo\.example$/);
    }
  });

  it('all user IDs start with "demo-"', () => {
    for (const user of DEMO_USERS) {
      expect(user.id.startsWith('demo-')).toBe(true);
    }
  });

  it('contains admin, editor, and viewer roles', () => {
    const roles = DEMO_USERS.map((u) => u.role);
    expect(roles).toContain('admin');
    expect(roles).toContain('editor');
    expect(roles).toContain('viewer');
  });
});

// ============================================================================
// DEMO_ORGANIZATION
// ============================================================================

describe('DEMO_ORGANIZATION', () => {
  it('has the correct id', () => {
    expect(DEMO_ORGANIZATION.id).toBe('demo-org');
  });

  it('has the pro plan', () => {
    expect(DEMO_ORGANIZATION.plan).toBe('pro');
  });

  it('has a slug', () => {
    expect(DEMO_ORGANIZATION.slug).toBe('spectree-demo');
  });
});

// ============================================================================
// DEMO_WORKSPACE
// ============================================================================

describe('DEMO_WORKSPACE', () => {
  it('is the default workspace', () => {
    expect(DEMO_WORKSPACE.isDefault).toBe(true);
  });

  it('belongs to the demo organization', () => {
    expect(DEMO_WORKSPACE.organizationId).toBe(DEMO_ORGANIZATION.id);
  });
});

// ============================================================================
// DEMO_EPICS
// ============================================================================

describe('DEMO_EPICS', () => {
  it('has exactly 2 epics', () => {
    expect(DEMO_EPICS).toHaveLength(2);
  });

  it('first epic is about user authentication', () => {
    expect(DEMO_EPICS[0].title).toContain('User Authentication');
  });

  it('second epic is about the project dashboard', () => {
    expect(DEMO_EPICS[1].title).toContain('Project Dashboard');
  });

  it('each epic has feature IDs', () => {
    for (const epic of DEMO_EPICS) {
      expect(epic.featureIds.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// DEMO_FEATURES
// ============================================================================

describe('DEMO_FEATURES', () => {
  it('has exactly 4 features', () => {
    expect(DEMO_FEATURES).toHaveLength(4);
  });

  it('all features are linked to valid epics', () => {
    const epicIds = new Set(DEMO_EPICS.map((e) => e.id));
    for (const feature of DEMO_FEATURES) {
      expect(epicIds.has(feature.parentEpicId)).toBe(true);
    }
  });

  it('each feature has acceptance criteria', () => {
    for (const feature of DEMO_FEATURES) {
      expect(feature.acceptanceCriteria.length).toBeGreaterThan(0);
    }
  });

  it('each feature has user story IDs', () => {
    for (const feature of DEMO_FEATURES) {
      expect(feature.userStoryIds.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// DEMO_USER_STORIES
// ============================================================================

describe('DEMO_USER_STORIES', () => {
  it('has exactly 8 user stories', () => {
    expect(DEMO_USER_STORIES).toHaveLength(8);
  });

  it('all stories are linked to valid features', () => {
    const featureIds = new Set(DEMO_FEATURES.map((f) => f.id));
    for (const story of DEMO_USER_STORIES) {
      expect(featureIds.has(story.parentFeatureId)).toBe(true);
    }
  });

  it('each story has role, action, and goal fields', () => {
    for (const story of DEMO_USER_STORIES) {
      expect(story.role.length).toBeGreaterThan(0);
      expect(story.action.length).toBeGreaterThan(0);
      expect(story.goal.length).toBeGreaterThan(0);
    }
  });

  it('each story has task IDs', () => {
    for (const story of DEMO_USER_STORIES) {
      expect(story.taskIds.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// DEMO_TASKS
// ============================================================================

describe('DEMO_TASKS', () => {
  it('has exactly 16 tasks', () => {
    expect(DEMO_TASKS).toHaveLength(16);
  });

  it('all tasks are linked to valid user stories', () => {
    const storyIds = new Set(DEMO_USER_STORIES.map((s) => s.id));
    for (const task of DEMO_TASKS) {
      expect(storyIds.has(task.parentUserStoryId)).toBe(true);
    }
  });

  it('each task has a title and details', () => {
    for (const task of DEMO_TASKS) {
      expect(task.title.length).toBeGreaterThan(0);
      expect(task.details.length).toBeGreaterThan(0);
    }
  });

  it('each task has a priority of 1 or 2', () => {
    for (const task of DEMO_TASKS) {
      expect([1, 2]).toContain(task.priority);
    }
  });

  it('all task IDs start with "demo-"', () => {
    for (const task of DEMO_TASKS) {
      expect(task.id.startsWith('demo-')).toBe(true);
    }
  });
});

// ============================================================================
// DEMO_ROLES constant
// ============================================================================

describe('DEMO_ROLES', () => {
  it('contains exactly 3 roles', () => {
    expect(DEMO_ROLES).toHaveLength(3);
  });

  it('includes admin, editor, and viewer', () => {
    expect(DEMO_ROLES).toContain('admin');
    expect(DEMO_ROLES).toContain('editor');
    expect(DEMO_ROLES).toContain('viewer');
  });
});
