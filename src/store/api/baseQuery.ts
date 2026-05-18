import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { logout, setCredentials } from '../slices/authSlice';
import type { ApiResponse } from '../../types/api';
import type { AuthResponse, User } from '../../types/auth';
import { mapApiRoleToUi } from '../../utils/role';

interface LocalAuthState {
  auth: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/** Attaches Bearer access token (may be expired). */
const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as LocalAuthState).auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

/**
 * No Authorization header — refresh must not send an expired access token.
 * Some gateways/services reject the request before reading the refresh body.
 */
const baseQueryWithoutAuth = fetchBaseQuery({ baseUrl });

let refreshInFlight: Promise<boolean> | null = null;

/** Spring (and some gateways) return 403 when JWT is missing/invalid on authenticated routes, not 401. */
function shouldTryRefresh(status: number | string | undefined): boolean {
  return status === 401 || status === 403;
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (path === '/login' || path === '/admin/login' || path === '/register') return;
  window.location.replace(path.startsWith('/admin') ? '/admin/login' : '/login');
}

function normalizeUser(raw: AuthResponse['user']): User {
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.fullName ?? '',
    roleName: mapApiRoleToUi(raw.roleName),
  };
}

/**
 * Single-flight refresh: parallel 401s share one refresh; avoids invalidating a just-used refresh token.
 */
async function refreshSession(api: Parameters<BaseQueryFn>[1]): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async (): Promise<boolean> => {
    const refreshToken = (api.getState() as LocalAuthState).auth.refreshToken;
    if (!refreshToken) return false;

    try {
      const refreshResult = await baseQueryWithoutAuth(
        {
          url: '/common/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        {}
      );

      if (refreshResult.error || refreshResult.data == null) return false;

      const envelope = refreshResult.data as ApiResponse<AuthResponse>;
      const d = envelope.data;
      if (!d?.accessToken || !d?.refreshToken || !d?.user) return false;

      api.dispatch(
        setCredentials({
          user: normalizeUser(d.user),
          accessToken: d.accessToken,
          refreshToken: d.refreshToken,
        })
      );
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  const status = result.error && 'status' in result.error ? result.error.status : undefined;
  if (!shouldTryRefresh(status)) return result;

  const { accessToken, refreshToken } = (api.getState() as LocalAuthState).auth;
  const hadSession = Boolean(accessToken || refreshToken);
  if (!hadSession) return result;

  const refreshed = await refreshSession(api);
  if (!refreshed) {
    api.dispatch(logout());
    redirectToLogin();
    return result;
  }

  result = await baseQuery(args, api, extraOptions);
  const retryStatus = result.error && 'status' in result.error ? result.error.status : undefined;
  if (shouldTryRefresh(retryStatus)) {
    api.dispatch(logout());
    redirectToLogin();
  }

  return result;
};
