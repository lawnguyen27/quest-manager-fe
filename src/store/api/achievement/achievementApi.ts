import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';
import { walletApi } from '../wallet/walletApi';
import type { ApiResponse } from '../../../types/api';
import type { PageResponse } from '../../../types/mission';
import type {
  AchievementDto,
  UserAchievementDto,
  UserAchievementJoinDto,
} from '../../../types/achievement';

export const achievementApi = createApi({
  reducerPath: 'achievementApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Achievement', 'UserAchievement'],
  endpoints: (builder) => ({
    getAchievements: builder.query<PageResponse<AchievementDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 }) => `/public/achievements?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<AchievementDto>>) => response.data,
      providesTags: ['Achievement'],
    }),
    getAchievementById: builder.query<AchievementDto, number>({
      query: (id) => `/public/achievements/${id}`,
      transformResponse: (response: ApiResponse<AchievementDto>) => response.data,
      providesTags: (_r, _e, id) => [{ type: 'Achievement', id }],
    }),
    getMyUserAchievements: builder.query<PageResponse<UserAchievementDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 }) => `/public/user-achievements/me?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<UserAchievementDto>>) => response.data,
      providesTags: ['UserAchievement'],
    }),
    joinUserAchievement: builder.mutation<UserAchievementDto, UserAchievementJoinDto>({
      query: (body) => ({
        url: '/public/user-achievements',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<UserAchievementDto>) => response.data,
      invalidatesTags: ['UserAchievement'],
    }),
    updateUserAchievementStatus: builder.mutation<
      UserAchievementDto,
      { id: number; status: UserAchievementDto['status'] }
    >({
      query: ({ id, status }) => ({
        url: `/public/user-achievements/${id}/status?status=${status}`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<UserAchievementDto>) => response.data,
      invalidatesTags: ['UserAchievement'],
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
  useGetAchievementsQuery,
  useGetAchievementByIdQuery,
  useGetMyUserAchievementsQuery,
  useJoinUserAchievementMutation,
  useUpdateUserAchievementStatusMutation,
} = achievementApi;
