import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import {
  useGetAchievementsQuery,
  useGetMyUserAchievementsQuery,
} from '../../store/api/achievement/achievementApi';
import { useAcceptPolicyMutation } from '../../store/api/user/userApi';
import { getApiErrorMessage } from '../../utils/errorMessage';
import Button from '../../components/ui/Button';
import { CheckCircle, FileText, ScrollText } from 'lucide-react';
import { toast } from 'sonner';

const PolicyCustomerPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  const { data: achPage, isLoading: loadingAch } = useGetAchievementsQuery(
    { page: 0, size: 100 },
    { skip: !isAuthenticated }
  );
  const { data: minePage, refetch: refetchMine } = useGetMyUserAchievementsQuery(
    { page: 0, size: 100 },
    { skip: !isAuthenticated }
  );
  const [acceptPolicy, { isLoading: accepting }] = useAcceptPolicyMutation();

  const policyAchievement = useMemo(
    () => achPage?.content.find((a) => a.achievementType === 'POLICY'),
    [achPage]
  );

  const policyUserRow = useMemo(() => {
    if (!policyAchievement || !minePage?.content) return undefined;
    return minePage.content.find((u) => u.achievementId === policyAchievement.id);
  }, [minePage, policyAchievement]);

  const isDone = policyUserRow?.status === 'COMPLETED';

  const scrollRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setReachedEnd(scrollHeight - scrollTop - clientHeight < 32);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, [isAuthenticated]);

  const handleConfirm = async () => {
    if (!isAuthenticated) return;
    setErrorMsg(null);
    try {
      await acceptPolicy({ isReadPolicy: true }).unwrap();
      await refetchMine();
      toast.success(t('toast.policy_confirmed'));
    } catch (err) {
      const msg = getApiErrorMessage(err, t('policy.error'));
      const alreadyRead =
        /already/i.test(msg) ||
        /đã\s*(được\s*)?đọc/i.test(msg) ||
        /policy.*read/i.test(msg);
      if (alreadyRead) {
        await refetchMine();
        toast.message(t('policy.already_done'));
      } else {
        setErrorMsg(msg);
        toast.error(msg);
      }
    }
  };

  const canSubmit = isAuthenticated && reachedEnd && agreed && !isDone && !accepting;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('policy.title')}</h1>
          <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">{t('policy.subtitle')}</p>
        </div>
      </div>

      <article
        ref={scrollRef}
        className="max-h-[min(70vh,520px)] space-y-6 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('policy.section_1_title')}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t('policy.section_1_body')}
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('policy.section_2_title')}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t('policy.section_2_body')}
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('policy.section_3_title')}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t('policy.section_3_body')}
          </p>
        </section>
        <p className="border-t border-slate-100 pt-4 text-center text-xs font-medium text-slate-400 dark:border-slate-800">
          — {t('policy.end_marker')} —
        </p>
      </article>

      {isAuthenticated && (
        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ScrollText className="h-4 w-4 shrink-0" />
          {reachedEnd ? t('policy.scroll_done') : t('policy.scroll_hint')}
        </p>
      )}

      {isAuthenticated && loadingAch && (
        <p className="text-sm text-slate-500">{t('common.loading')}</p>
      )}

      {isAuthenticated && !loadingAch && !policyAchievement && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {t('policy.no_config')}
        </p>
      )}

      {isDone && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <CheckCircle className="h-8 w-8 shrink-0 text-emerald-600" />
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">{t('policy.already_done')}</p>
        </div>
      )}

      {errorMsg && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{errorMsg}</p>
      )}

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        {isAuthenticated && !isDone && (
          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              checked={agreed}
              disabled={!reachedEnd}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>{t('policy.checkbox')}</span>
          </label>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('policy.login_prompt')}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {!isAuthenticated ? (
            <Button variant="primary" className="rounded-xl" onClick={() => navigate('/login')}>
              {t('policy.login_to_confirm')}
            </Button>
          ) : (
            !isDone && (
              <Button
                variant="primary"
                className="rounded-xl"
                disabled={!canSubmit}
                isLoading={accepting}
                onClick={() => void handleConfirm()}
              >
                {t('policy.confirm')}
              </Button>
            )
          )}
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t('policy.back_home')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PolicyCustomerPage;
