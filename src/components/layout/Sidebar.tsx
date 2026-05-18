import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { 
  Home, 
  Target, 
  History, 
  User as UserIcon, 
  Users, 
  Settings, 
  LayoutDashboard, 
  Briefcase,
  Trophy,
  FileText,
  ShoppingBag,
  Package,
  ClipboardList,
} from 'lucide-react';

interface SidebarLink {
  to: string;
  label: string;
  icon: any;
  end?: boolean;
}

import { useTranslation } from 'react-i18next';

const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = user?.roleName === 'ADMIN';

  const customerLinks: SidebarLink[] = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/quests', label: t('nav.quests'), icon: Target },
    { to: '/shop', label: t('nav.shop'), icon: ShoppingBag },
    { to: '/inventory', label: t('nav.inventory'), icon: Package },
    { to: '/policy', label: t('nav.policy'), icon: FileText },
    { to: '/history', label: t('nav.progress'), icon: History },
    { to: '/profile', label: t('nav.profile'), icon: UserIcon },
  ];

  const adminLinks: SidebarLink[] = [
    { to: '/admin', label: t('nav.admin'), icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: t('nav.users'), icon: Users },
    { to: '/admin/missions', label: t('nav.management'), icon: Briefcase },
    { to: '/admin/achievements', label: t('nav.achievements_admin'), icon: Trophy },
    { to: '/admin/items', label: t('nav.shop_items_admin'), icon: ShoppingBag },
    { to: '/admin/orders', label: t('nav.orders_admin'), icon: ClipboardList },
    { to: '/admin/tracking', label: t('nav.tracking'), icon: Settings },
    { to: '/profile', label: t('nav.profile'), icon: UserIcon },
  ];

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
        : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-primary-400'
    }`;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white flex flex-col dark:border-slate-800 dark:bg-slate-900 shadow-xl">
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="mb-8 flex items-center gap-2 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg">
            <Target className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            QuestManager
          </span>
        </div>

        <nav className="space-y-6">
          <div>
            <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isAdmin ? t('nav.admin_menu') : t('nav.customer_menu')}
            </p>
            <div className="space-y-1">
              {(isAdmin ? adminLinks : customerLinks).map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    navItemClass({
                      isActive:
                        isActive ||
                        (link.to === '/quests' && location.pathname.startsWith('/missions')),
                    })
                  }
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="p-4 border-t dark:border-slate-800">
        <div className="rounded-2xl bg-slate-900 p-4 dark:bg-slate-800 overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary-600 opacity-20 transition-transform group-hover:scale-150"></div>
          <p className="relative text-sm font-semibold text-white">{t('common.support')}</p>
          <p className="relative mt-1 text-xs text-slate-400">{t('common.support_desc')}</p>
          <button className="relative mt-3 w-full rounded-lg bg-white py-1.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors">
            {t('common.contact')}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
