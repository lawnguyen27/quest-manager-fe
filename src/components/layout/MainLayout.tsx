import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useTranslation } from 'react-i18next';
import AchievementAutoEnroll from '../customer/AchievementAutoEnroll';

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.roleName === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {isAdmin && <Sidebar />}
      <div className={`${isAdmin ? 'lg:pl-64' : ''} flex flex-col min-h-screen transition-all duration-300`}>
        {user && !isAdmin ? <AchievementAutoEnroll /> : null}
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
        <footer className="border-t bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div>&copy; 2026 QuestManager App. All rights reserved.</div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link to="/policy" className="hover:text-primary-600">
                {t('nav.policy')}
              </Link>
              <Link to="/about" className="hover:text-primary-600">
                {t('nav.about')}
              </Link>
              <a href="#" className="hover:text-primary-600">
                {t('common.support')}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
