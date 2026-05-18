import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';

export interface NotificationDto {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface PushNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: string;
}

/** Admin broadcast — no userId */
export interface BroadcastNotificationRequest {
  title: string;
  message: string;
  type: string;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    // User: get own notifications
    getMyNotifications: builder.query<NotificationDto[], void>({
      query: () => '/public/notifications',
      transformResponse: (rows: NotificationDto[]) =>
        rows.map((n) => ({
          ...n,
          // Back-compat if backend ever emitted "read" instead of "isRead"
          isRead: typeof n.isRead === 'boolean' ? n.isRead : !!(n as unknown as { read?: boolean }).read,
        })),
      providesTags: ['Notification'],
    }),

    // User: mark as read
    markNotificationAsRead: builder.mutation<void, number>({
      query: (id) => ({
        url: `/public/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Admin: push custom notification to a user
    pushNotification: builder.mutation<NotificationDto, PushNotificationRequest>({
      query: (body) => ({
        url: '/private/notifications/push',
        method: 'POST',
        body,
      }),
    }),

    // Admin: broadcast to every user (persist + WebSocket per user)
    pushNotificationToAll: builder.mutation<void, BroadcastNotificationRequest>({
      query: (body) => ({
        url: '/private/notifications/push/all',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useMarkNotificationAsReadMutation,
  usePushNotificationMutation,
  usePushNotificationToAllMutation,
} = notificationApi;
