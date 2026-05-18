import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';
import type { ApiResponse } from '../../../types/api';
import type { WalletDto } from '../../../types/wallet';

const unwrapWallet = (
  payload: WalletDto | ApiResponse<WalletDto> | null | undefined
): WalletDto | null => {
  if (payload == null) return null;
  if (typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<WalletDto>).data ?? null;
  }
  return payload as WalletDto;
};

export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Wallet'],
  endpoints: (builder) => ({
    getMyWallet: builder.query<WalletDto, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const getResult = await baseQuery('/public/wallet/me');
        if (getResult.error) {
          return { error: getResult.error };
        }

        const existingWallet = unwrapWallet(
          getResult.data as WalletDto | ApiResponse<WalletDto> | null | undefined
        );
        if (existingWallet) {
          return { data: existingWallet };
        }

        const createResult = await baseQuery({
          url: '/public/wallet/me',
          method: 'POST',
        });
        if (createResult.error) {
          return { error: createResult.error };
        }

        const createdWallet = unwrapWallet(
          createResult.data as WalletDto | ApiResponse<WalletDto> | null | undefined
        );
        if (!createdWallet) {
          return {
            error: {
              status: 'PARSING_ERROR',
              originalStatus: 200,
              data: JSON.stringify(createResult.data ?? null),
              error: 'Wallet creation returned empty payload.',
            },
          };
        }

        return { data: createdWallet };
      },
      providesTags: ['Wallet'],
    }),
    createMyWallet: builder.mutation<WalletDto, void>({
      query: () => ({
        url: '/public/wallet/me',
        method: 'POST',
      }),
      transformResponse: (response: WalletDto | ApiResponse<WalletDto>) =>
        unwrapWallet(response) as WalletDto,
      invalidatesTags: ['Wallet'],
    }),
    getAllWallets: builder.query<WalletDto[], void>({
      query: () => '/private/wallet/all',
      transformResponse: (response: ApiResponse<WalletDto[]>) => response.data,
      providesTags: ['Wallet'],
    }),
    getWalletByUserId: builder.query<WalletDto, number>({
      query: (userId) => `/private/wallet/user/${userId}`,
      transformResponse: (response: ApiResponse<WalletDto>) => response.data,
      providesTags: ['Wallet'],
    }),
  }),
});

export const { 
  useGetMyWalletQuery, 
  useCreateMyWalletMutation,
  useGetAllWalletsQuery, 
  useGetWalletByUserIdQuery 
} = walletApi;
