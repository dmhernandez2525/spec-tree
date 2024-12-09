'use client';

// External imports
import React, { useEffect, useState } from 'react';
// Redux
import { useAppDispatch } from '../../lib/hooks/use-store';
import { refreshUser } from '../../lib/store/user-slice';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  // ================
  // Hooks
  // ================
  const dispatch = useAppDispatch();

  // ================
  // State
  // ================
  const [loading, setLoading] = useState(false);

  // ================
  // Variables
  // ================

  // ================
  // Dynamic Imports
  // ================

  // ================
  // Handle Functions
  // ================

  // =================
  // Use Effect
  // =================
  useEffect(() => {
    setLoading(true);
    const fetchNavData = async () => {
      try {
        await refreshUser(dispatch);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchNavData();
    setLoading(false);
  }, []);

  // =================
  // Display Functions
  // =================

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>{children}</div>;
};
