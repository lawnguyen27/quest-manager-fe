import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target, Trophy } from 'lucide-react';
import MissionsCustomerPage from './MissionsCustomerPage';
import AchievementsCustomerPage from './AchievementsCustomerPage';

type QuestsSubTab = 'missions' | 'achievements';

const QuestsHubPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const sub: QuestsSubTab =
    searchParams.get('tab') === 'achievements' ? 'achievements' : 'missions';

  const setSub = (tab: QuestsSubTab) => {
    if (tab === 'achievements') setSearchParams({ tab: 'achievements' });
    else setSearchParams({});
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
        <button
          type="button"
          onClick={() => setSub('missions')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            sub === 'missions'
              ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-800 dark:text-primary-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Target className="h-4 w-4 shrink-0" />
          {t('nav.missions')}
        </button>
        <button
          type="button"
          onClick={() => setSub('achievements')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            sub === 'achievements'
              ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-800 dark:text-primary-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Trophy className="h-4 w-4 shrink-0" />
          {t('nav.achievements')}
        </button>
      </div>

      {sub === 'missions' ? <MissionsCustomerPage /> : <AchievementsCustomerPage />}
    </div>
  );
};

export default QuestsHubPage;
