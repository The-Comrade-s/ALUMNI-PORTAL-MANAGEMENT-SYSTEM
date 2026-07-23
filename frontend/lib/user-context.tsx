'use client';

import { createContext, useContext } from 'react';

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: { slug: string; name?: string };
  alumni_profile?: { photo_url: string | null } | null;
}

/**
 * Populated by AuthGuard once /auth/me resolves, so every page/component
 * under the dashboard layout can read the real signed-in user (name, role,
 * avatar) without re-fetching it. Null until AuthGuard has confirmed auth.
 */
const UserContext = createContext<CurrentUser | null>(null);

export const UserProvider = UserContext.Provider;

export function useCurrentUser(): CurrentUser | null {
  return useContext(UserContext);
}
