import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';
import { walletApi } from '../wallet/walletApi';
import type { ApiResponse } from '../../../types/api';
import type { MissionDto, PageResponse, UserMissionDto, UserMissionUpdateDto } from '../../../types/mission';

export const missionApi = createApi({
  reducerPath: 'missionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UserMission'],
  endpoints: (builder) => ({
    getMissions: builder.query<PageResponse<MissionDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 }) => `/public/missions?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<MissionDto>>) => response.data,
    }),
    getMyUserMissions: builder.query<PageResponse<UserMissionDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 }) => `/public/user-missions/me?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<UserMissionDto>>) => response.data,
      providesTags: ['UserMission'],
    }),
    getMyUserMissionById: builder.query<UserMissionDto, number>({
      query: (id) => `/public/user-missions/me/${id}`,
      transformResponse: (response: ApiResponse<UserMissionDto>) => response.data,
      providesTags: (_r, _e, id) => [{ type: 'UserMission', id: `me-${id}` }],
    }),
    getMissionById: builder.query<MissionDto, number>({
      query: (id) => `/public/missions/${id}`,
      transformResponse: (response: ApiResponse<MissionDto>) => response.data,
    }),
    createUserMission: builder.mutation<UserMissionDto, UserMissionUpdateDto>({
      query: (body) => ({
        url: '/public/user-missions',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<UserMissionDto>) => response.data,
      invalidatesTags: ['UserMission'],
    }),
    updateUserMissionStatus: builder.mutation<UserMissionDto, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/public/user-missions/${id}/status?status=${status}`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<UserMissionDto>) => response.data,
      invalidatesTags: ['UserMission'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(walletApi.util.invalidateTags(['Wallet']));
        } catch {
          /* ignore */
        }
      },
    }),
  }),
});

export const { 
  useGetMissionsQuery, 
  useGetMissionByIdQuery,
  useGetMyUserMissionsQuery,
  useGetMyUserMissionByIdQuery,
  useCreateUserMissionMutation, 
  useUpdateUserMissionStatusMutation 
} = missionApi;
