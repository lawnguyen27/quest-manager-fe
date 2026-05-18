import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';
import type { ApiResponse } from '../../../types/api';
import { mapApiRoleToUi } from '../../../utils/role';
import { walletApi } from '../wallet/walletApi';
import { achievementApi } from '../achievement/achievementApi';

export interface UserDto {
  id: number;
  email: string;
  birthday: string;
  phone: string;
  fullName: string;
  gender: string;
  city: string;
  address: string;
  roleName: string;
  points?: number;
  /** When BE exposes it — policy accepted on server */
  policyRead?: boolean;
  emailVerified?: boolean;
}

/** Matches BE UserUpdateRequestDto — omit fields you do not want to change */
export interface UserUpdateRequest {
  fullName?: string;
  phone?: string;
  city?: string;
  address?: string;
  gender?: string;
  birthday?: string;
  password?: string;
}

/** BE `PATCH /public/users/me/policy` body */
export interface AcceptPolicyRequest {
  isReadPolicy: boolean;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getMe: builder.query<UserDto, void>({
      query: () => '/public/users/me',
      providesTags: ['User'],
      transformResponse: (response: ApiResponse<UserDto>) => ({
        ...response.data,
        roleName: mapApiRoleToUi(response.data.roleName),
      }),
    }),
    updateMe: builder.mutation<UserDto, UserUpdateRequest>({
      query: (body) => ({
        url: '/public/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: ApiResponse<UserDto>) => ({
        ...response.data,
        roleName: mapApiRoleToUi(response.data.roleName),
      }),
    }),
    acceptPolicy: builder.mutation<UserDto, AcceptPolicyRequest>({
      query: (body) => ({
        url: '/public/users/me/policy',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: ApiResponse<UserDto>) => ({
        ...response.data,
        roleName: mapApiRoleToUi(response.data.roleName),
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(walletApi.util.invalidateTags(['Wallet']));
          dispatch(achievementApi.util.invalidateTags(['UserAchievement']));
        } catch {
          /* handled by caller */
        }
      },
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation, useAcceptPolicyMutation } = userApi;
