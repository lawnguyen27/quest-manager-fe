import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';
import type { ApiResponse } from '../../../types/api';
import type { PageResponse } from '../../../types/mission';
import type { ItemDto, UserItemDto } from '../../../types/item';
import { walletApi } from '../wallet/walletApi';

function mapItem(raw: ItemDto & { available?: boolean }): ItemDto {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    price: Number(raw.price),
    imageLink: raw.imageLink ?? null,
    isAvailable: raw.isAvailable ?? raw.available ?? true,
  };
}

export const itemApi = createApi({
  reducerPath: 'itemApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PublicItem', 'UserItem'],
  endpoints: (builder) => ({
    getPublicItems: builder.query<PageResponse<ItemDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 }) => `/public/items?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<ItemDto>>) => ({
        ...response.data,
        content: response.data.content.map(mapItem),
      }),
      providesTags: ['PublicItem'],
    }),
    getMyUserItems: builder.query<PageResponse<UserItemDto>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 100 }) => `/public/user-items/my?page=${page}&size=${size}`,
      transformResponse: (response: ApiResponse<PageResponse<UserItemDto>>) => response.data,
      providesTags: ['UserItem'],
    }),
    buyItem: builder.mutation<UserItemDto, number>({
      query: (itemId) => ({
        url: `/public/user-items/buy/${itemId}`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<UserItemDto>) => response.data,
      invalidatesTags: ['UserItem'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(walletApi.util.invalidateTags(['Wallet']));
        } catch {
          /* caller handles errors */
        }
      },
    }),
  }),
});

export const { useGetPublicItemsQuery, useGetMyUserItemsQuery, useBuyItemMutation } = itemApi;
