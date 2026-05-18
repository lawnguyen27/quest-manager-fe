import React, { useMemo } from 'react';
import {
  useGetAchievementsQuery,
  useGetMyUserAchievementsQuery,
} from '../../store/api/achievement/achievementApi';
import type { UserAchievementDto } from '../../types/achievement';
import { Award, CheckCircle, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AchievementsCustomerPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const navigate = useNavigate();
  const { data: achPage, isLoading: loadingAch } = useGetAchievementsQuery({ page: 0, size: 100 });
  const { data: minePage, isLoading: loadingMine } = useGetMyUserAchievementsQuery(
    { page: 0, size: 200 },
    { skip: !isAuthenticated }
  );

  const activeAchievements = useMemo(
    () => achPage?.content.filter((a) => a.achievementStatus === 'ACTIVE') ?? [],
    [achPage]
  );

  const byAchievementId = useMemo(() => {
    const m = new Map<number, UserAchievementDto>();
    minePage?.content.forEach((row) => m.set(row.achievementId, row));
    return m;
  }, [minePage]);

  if (loadingAch || (isAuthenticated && loadingMine)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('achievements.title')}</h1>
        <p className="mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400">{t('achievements.subtitle_auto')}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {activeAchievements.length === 0 ? (
          <p className="p-8 text-center text-slate-500">{t('achievements.empty')}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeAchievements.map((a) => {
              const mine = byAchievementId.get(a.id);
              const status = mine?.status;
              return (
                <li
                  key={a.id}
                  className="flex flex-col gap-4 p-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:gap-6 sm:p-5 dark:hover:bg-slate-800/40"
                >
                  <div
                    className="flex h-20 w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/20 to-violet-600/30 sm:h-24 sm:w-40"
                    aria-hidden
                  >
                    <img
                      src={`https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=60&sig=${a.id}`}
                      alt=""
                      className="h-full w-full object-cover mix-blend-overlay opacity-90"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{a.name}</h2>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {a.achievementType}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{a.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end sm:text-right">
                    <span className="inline-flex items-center justify-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-800 dark:bg-amber-900/35 dark:text-amber-200">
                      <Award className="h-4 w-4" />+{a.points} {t('profile.points')}
                    </span>
                    {!isAuthenticated && (
                      <Button size="sm" className="rounded-xl" onClick={() => navigate('/login')}>
                        {t('auth.signin')}
                      </Button>
                    )}
                    {isAuthenticated && !mine && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        {t('achievements.syncing')}
                      </span>
                    )}
                    {isAuthenticated && status === 'PROCESSING' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                        <Clock className="h-3.5 w-3.5" />
                        {t('achievements.in_progress')}
                      </span>
                    )}
                    {isAuthenticated && status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t('achievements.done')}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AchievementsCustomerPage;
