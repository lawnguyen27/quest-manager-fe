import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';
import type { ApiResponse } from '../../../types/api';
import type { UserDto } from '../user/userApi';
import type { MissionDto, PageResponse, UserMissionDto } from '../../../types/mission';
import type { AchievementDto } from '../../../types/achievement';
import type { ItemDto, UserItemDto } from '../../../types/item';
import { mapApiRoleToUi } from '../../../utils/role';
import { itemApi } from '../item/itemApi';

export type AdminMissionSaveBody = Omit<MissionDto, 'id'>;

/** JSON part for multipart `item` — matches wallet-service ItemDto */
export type AdminItemSaveBody = {
  name: string;
  description: string;
  price: number;
  imageLink?: string;
  isAvailable?: boolean;
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminUser', 'AdminMission', 'AdminUserMission', 'AdminAchievement', 'AdminItem', 'AdminUserItem'],
  endpoints: (builder) => ({
    // User management
    getAdminUsers: builder.query<UserDto[], void>({
      query: () => '/private/users',
      transformResponse: (response: ApiResponse<UserDto[]>) =>
        response.data.map((user) => ({
          ...user,
          roleName: mapApiRoleToUi(user.roleName),
        })),
      providesTags: ['AdminUser'],
    }),
    
    // Mission management
    getAdminMissions: builder.query<PageResponse<MissionDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 }) => `/private/missions?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<MissionDto>>) => response.data,
      providesTags: ['AdminMission'],
    }),
    createAdminMission: builder.mutation<
      MissionDto,
      { mission: AdminMissionSaveBody; image?: File | null }
    >({
      query: ({ mission, image }) => {
        const fd = new FormData();
        fd.append('mission', new Blob([JSON.stringify(mission)], { type: 'application/json' }));
        if (image && image.size > 0) fd.append('image', image);
        return { url: '/private/missions', method: 'POST', body: fd };
      },
      transformResponse: (response: ApiResponse<MissionDto>) => response.data,
      invalidatesTags: ['AdminMission'],
    }),
    updateAdminMission: builder.mutation<
      MissionDto,
      { id: number; mission: AdminMissionSaveBody; image?: File | null }
    >({
      query: ({ id, mission, image }) => {
        const fd = new FormData();
        fd.append('mission', new Blob([JSON.stringify(mission)], { type: 'application/json' }));
        if (image && image.size > 0) fd.append('image', image);
        return { url: `/private/missions/${id}`, method: 'PUT', body: fd };
      },
      transformResponse: (response: ApiResponse<MissionDto>) => response.data,
      invalidatesTags: ['AdminMission'],
    }),
    deleteAdminMission: builder.mutation<void, number>({
      query: (id) => ({
        url: `/private/missions/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
      invalidatesTags: ['AdminMission'],
    }),

    // UserMission tracking
    getAdminUserMissions: builder.query<PageResponse<UserMissionDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 }) => `/private/user-missions?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<UserMissionDto>>) => response.data,
      providesTags: ['AdminUserMission'],
    }),

    getAdminAchievements: builder.query<PageResponse<AchievementDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 }) => `/private/achievements?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<AchievementDto>>) => response.data,
      providesTags: ['AdminAchievement'],
    }),
    createAdminAchievement: builder.mutation<AchievementDto, Omit<AchievementDto, 'id'>>({
      query: (body) => ({
        url: '/private/achievements',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<AchievementDto>) => response.data,
      invalidatesTags: ['AdminAchievement'],
    }),
    updateAdminAchievement: builder.mutation<AchievementDto, { id: number; body: Omit<AchievementDto, 'id'> }>({
      query: ({ id, body }) => ({
        url: `/private/achievements/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<AchievementDto>) => response.data,
      invalidatesTags: ['AdminAchievement'],
    }),
    deleteAdminAchievement: builder.mutation<void, number>({
      query: (id) => ({
        url: `/private/achievements/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
      invalidatesTags: ['AdminAchievement'],
    }),

    /** All purchase rows (orders) across users — admin wallet API */
    getAdminAllUserItems: builder.query<PageResponse<UserItemDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 }) => `/private/user-items?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<UserItemDto>>) => response.data,
      providesTags: ['AdminUserItem'],
    }),

    /** One user's purchases / warehouse lines — admin wallet API */
    getAdminUserItemsByUserId: builder.query<
      PageResponse<UserItemDto>,
      { userId: number; page?: number; size?: number }
    >({
      query: ({ userId, page = 0, size = 20 }) =>
        `/private/user-items/${userId}?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<UserItemDto>>) => response.data,
      providesTags: (_r, _e, { userId }) => [{ type: 'AdminUserItem' as const, id: `USER_${userId}` }],
    }),

    getAdminItems: builder.query<PageResponse<ItemDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 }) => `/private/items?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<ItemDto>>) => response.data,
      providesTags: ['AdminItem'],
    }),
    createAdminItem: builder.mutation<ItemDto, { item: AdminItemSaveBody; image?: File | null }>({
      query: ({ item, image }) => {
        const fd = new FormData();
        fd.append('item', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image && image.size > 0) fd.append('image', image);
        return { url: '/private/items', method: 'POST', body: fd };
      },
      transformResponse: (response: ApiResponse<ItemDto>) => response.data,
      invalidatesTags: ['AdminItem'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(itemApi.util.invalidateTags(['PublicItem']));
        } catch {
          /* noop */
        }
      },
    }),
    updateAdminItem: builder.mutation<
      ItemDto,
      { id: number; item: AdminItemSaveBody; image?: File | null }
    >({
      query: ({ id, item, image }) => {
        const fd = new FormData();
        fd.append('item', new Blob([JSON.stringify(item)], { type: 'application/json' }));
        if (image && image.size > 0) fd.append('image', image);
        return { url: `/private/items/${id}`, method: 'PUT', body: fd };
      },
      transformResponse: (response: ApiResponse<ItemDto>) => response.data,
      invalidatesTags: ['AdminItem'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(itemApi.util.invalidateTags(['PublicItem']));
        } catch {
          /* noop */
        }
      },
    }),
    deleteAdminItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/private/items/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
      invalidatesTags: ['AdminItem'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(itemApi.util.invalidateTags(['PublicItem']));
        } catch {
          /* noop */
        }
      },
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminMissionsQuery,
  useCreateAdminMissionMutation,
  useUpdateAdminMissionMutation,
  useDeleteAdminMissionMutation,
  useGetAdminUserMissionsQuery,
  useGetAdminAchievementsQuery,
  useCreateAdminAchievementMutation,
  useUpdateAdminAchievementMutation,
  useDeleteAdminAchievementMutation,
  useGetAdminAllUserItemsQuery,
  useGetAdminUserItemsByUserIdQuery,
  useGetAdminItemsQuery,
  useCreateAdminItemMutation,
  useUpdateAdminItemMutation,
  useDeleteAdminItemMutation,
} = adminApi;
