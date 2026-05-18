import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import { LogOut, User, Bell, Search, Target, Globe, ChevronDown, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getSockJsHttpUrl } from '../../utils/stompBrokerUrl';
import {
  useGetMyNotificationsQuery,
  useMarkNotificationAsReadMutation,
  type NotificationDto,
} from '../../store/api/public/notificationApi';
import { toast } from 'sonner';

/** Stable empty list — default `= []` in destructuring creates a new array every render and breaks useEffect deps. */
const EMPTY_NOTIFICATIONS: NotificationDto[] = [];

const Header: React.FC = () => {
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isAdmin = user?.roleName === 'ADMIN';

  const { data: initialNotifications } = useGetMyNotificationsQuery(undefined, {
    skip: !user,
    pollingInterval: user ? 20000 : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const serverNotifications = initialNotifications ?? EMPTY_NOTIFICATIONS;
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const notificationDropdownRef = useRef<HTMLDivElement | null>(null);

  const customerLinks: {
    to: string;
    label: string;
    end?: boolean;
    activePrefix?: string[];
  }[] = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/quests', label: t('nav.quests'), activePrefix: ['/missions'] },
    { to: '/history', label: t('nav.progress') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/inventory', label: t('nav.inventory') },
    { to: '/profile', label: t('nav.profile') },
    { to: '/about', label: t('nav.about') },
  ];

  useEffect(() => {
    setNotifications(serverNotifications);
  }, [serverNotifications]);

  useEffect(() => {
    if (!user || !accessToken) return;

    const stompOverride = import.meta.env.VITE_STOMP_URL as string | undefined;
    const client = new Client(
      stompOverride
        ? {
            brokerURL: stompOverride,
            connectHeaders: {
              Authorization: `Bearer ${accessToken}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
          }
        : {
            webSocketFactory: () => new SockJS(getSockJsHttpUrl()),
            connectHeaders: {
              Authorization: `Bearer ${accessToken}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
          }
    );

    client.onStompError = (frame) => {
      console.error('[STOMP]', frame.headers['message'] ?? frame.body);
    };
    client.onWebSocketError = (event) => {
      console.error('[STOMP] WebSocket error', event);
    };

    client.onConnect = () => {
      client.subscribe('/user/queue/notifications', (message) => {
        const body = message.body;
        if (!body) return;
        try {
          const newNotification = JSON.parse(body) as NotificationDto;
          setNotifications((prev) => [newNotification, ...prev]);
          toast(newNotification.title?.trim() || t('toast.incoming_notification'), {
            description: newNotification.message,
            duration: 5000,
          });
        } catch {
          console.error('Invalid notification payload from WebSocket');
        }
      });
    };

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
        stompClient.current = null;
      }
    };
  }, [user, accessToken, t]);

  useEffect(() => {
    if (!showNotifications) return;

    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      const el = notificationDropdownRef.current;
      if (!el?.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllUnreadAsRead = async (list: NotificationDto[]) => {
    const unread = list.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => markNotificationAsRead(n.id).unwrap()));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  const toggleNotifications = () => {
    if (showNotifications) {
      setShowNotifications(false);
      return;
    }
    setShowNotifications(true);
    void markAllUnreadAsRead(notifications);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const navLinkClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-bold transition-all lg:px-3 lg:text-sm ${
      isActive
        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20'
        : 'text-slate-600 hover:bg-slate-50 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-30 flex min-h-14 w-full items-center justify-between gap-3 border-b bg-white px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6 md:min-h-16 md:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6 lg:gap-8">
        <div className="flex shrink-0 items-center gap-2">
          {!isAdmin && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white md:hidden">
              <Target className="h-5 w-5" />
            </div>
          )}
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:hidden">QM</span>
        </div>

        {/* Customer Navigation — nowrap + horizontal scroll when labels are long (e.g. Vietnamese) */}
        {!isAdmin && (
          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overflow-y-visible md:flex md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden">
            {customerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  navLinkClass(
                    isActive ||
                      (link.activePrefix?.some((p) => location.pathname.startsWith(p)) ?? false)
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="relative hidden shrink-0 lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            className="h-9 w-48 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 xl:w-64 dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Language Switcher */}
        <div className="relative group">
          <button
            type="button"
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 sm:px-3"
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span>{i18n.language === 'vi' ? t('common.lang_vi') : t('common.lang_en')}</span>
            <ChevronDown className="h-3 w-3 shrink-0" />
          </button>
          <div className="absolute right-0 mt-1 w-32 origin-top-right scale-0 rounded-xl border border-slate-200 bg-white p-1 shadow-xl transition-all group-hover:scale-100 dark:border-slate-800 dark:bg-slate-900">
             <button 
               onClick={() => changeLanguage('en')}
               className={`flex w-full items-center px-3 py-2 text-xs font-bold rounded-lg ${i18n.language === 'en' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               {t('common.lang_en')}
             </button>
             <button 
               onClick={() => changeLanguage('vi')}
               className={`flex w-full items-center px-3 py-2 text-xs font-bold rounded-lg ${i18n.language === 'vi' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               {t('common.lang_vi')}
             </button>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                type="button"
                onClick={() => toggleNotifications()}
                className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur dark:bg-slate-900/90">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Notifications</h3>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">{unreadCount} New</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                        >
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{notification.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{notification.message}</p>
                          <span className="text-[10px] text-slate-400 mt-2 block">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden max-w-[10rem] text-right sm:block md:max-w-[14rem]">
                <p className="truncate text-sm font-semibold italic text-slate-900 dark:text-slate-100">
                  {user?.fullName || 'User'}
                </p>
                <p className="truncate text-xs font-medium uppercase tracking-wider text-slate-500">
                  {user?.roleName}
                </p>
              </div>
              <div className="relative group">
                <div className="h-10 w-10 cursor-pointer overflow-hidden rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-primary-500 shadow-inner">
                  {user?.fullName?.charAt(0) || <User className="h-6 w-6" />}
                </div>
                
                {/* Profile Dropdown */}
                <div className="absolute right-0 mt-2 w-48 origin-top-right scale-0 rounded-xl border border-slate-200 bg-white p-2 shadow-xl transition-all group-hover:scale-100 dark:border-slate-800 dark:bg-slate-900 z-50">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <User className="h-4 w-4" />
                    {t('nav.profile')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/policy')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <FileText className="h-4 w-4" />
                    {t('nav.policy')}
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('auth.logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="whitespace-nowrap px-2 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-primary-600 sm:px-4"
            >
              {t('auth.signin')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="whitespace-nowrap rounded-xl bg-primary-600 px-3 py-2 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 active:scale-95 sm:px-5"
            >
              {t('auth.signup')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
