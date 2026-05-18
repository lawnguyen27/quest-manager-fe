import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import { authApi } from './api/user/authApi';
import { userApi } from './api/user/userApi';
import { notificationApi } from './api/public/notificationApi';
import { missionApi } from './api/mission/missionApi';
import { adminApi } from './api/admin/adminApi';
import { walletApi } from './api/wallet/walletApi';
import { achievementApi } from './api/achievement/achievementApi';
import { itemApi } from './api/item/itemApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [missionApi.reducerPath]: missionApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [walletApi.reducerPath]: walletApi.reducer,
    [achievementApi.reducerPath]: achievementApi.reducer,
    [itemApi.reducerPath]: itemApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      notificationApi.middleware,
      missionApi.middleware,
      adminApi.middleware,
      walletApi.middleware,
      achievementApi.middleware,
      itemApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
