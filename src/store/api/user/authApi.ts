import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';
import type { ApiResponse } from '../../../types/api';
import type { AuthResponse, SigninRequest, SignupRequest } from '../../../types/auth';
import { mapApiRoleToUi } from '../../../utils/role';
import { userApi } from './userApi';
import { achievementApi } from '../achievement/achievementApi';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    signin: builder.mutation<AuthResponse, SigninRequest>({
      query: (credentials) => ({
        url: '/common/auth/signin',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => ({
        ...response.data,
        user: {
          ...response.data.user,
          roleName: mapApiRoleToUi(response.data.user.roleName),
        },
      }),
    }),
    signup: builder.mutation<void, SignupRequest>({
      query: (user) => ({
        url: '/common/auth/signup',
        method: 'POST',
        body: user,
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
    }),
    sendVerificationEmail: builder.mutation<void, { email: string }>({
      query: ({ email }) => ({
        url: '/public/auth/send-verification-email',
        method: 'POST',
        params: { email },
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
    }),
    verifyEmail: builder.mutation<void, { email: string; code: string }>({
      query: ({ email, code }) => ({
        url: '/public/auth/verify-email',
        method: 'POST',
        params: { email, code },
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(userApi.util.invalidateTags(['User']));
          dispatch(achievementApi.util.invalidateTags(['UserAchievement']));
        } catch {
          /* handled by caller */
        }
      },
    }),
  }),
});

export const {
  useSigninMutation,
  useSignupMutation,
  useSendVerificationEmailMutation,
  useVerifyEmailMutation,
} = authApi;
