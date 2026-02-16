'use client';

import React from 'react';
import { DEMO_ROLES, createDemoSession, type DemoRole } from '@/lib/demo/demo-mode';

interface RoleCardConfig {
  role: DemoRole;
  title: string;
  description: string;
}

const ROLE_CARDS: RoleCardConfig[] = [
  {
    role: 'admin',
    title: 'Admin',
    description:
      'Full access to all projects, settings, billing, and team management. Can create and delete workspaces.',
  },
  {
    role: 'editor',
    title: 'Editor',
    description:
      'Can create, edit, and organize epics, features, user stories, and tasks. Cannot modify workspace settings.',
  },
  {
    role: 'viewer',
    title: 'Viewer',
    description:
      'Read-only access to all project data. Can view specs, add comments, and export reports.',
  },
];

/**
 * Role selection page displayed when demo mode is active and
 * the user reaches the sign-in or sign-up page.
 * Allows visitors to choose a demo role and experience the app.
 */
export function DemoRoleSelector() {
  const handleSelectRole = (role: DemoRole) => {
    const session = createDemoSession(role);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'spectree-demo-session',
        JSON.stringify(session)
      );
      window.location.href = '/user-dashboard';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          SpecTree
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Choose a role to explore the demo
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        {ROLE_CARDS.map((card) => (
          <div
            key={card.role}
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {card.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-gray-600">
              {card.description}
            </p>
            <button
              onClick={() => handleSelectRole(card.role)}
              className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try as {card.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
