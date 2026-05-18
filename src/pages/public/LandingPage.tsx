import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  Target,
  Award,
  ArrowRight,
  Coins,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Zap,
  ChevronDown,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import CustomerHomePage from '../store/CustomerHomePage';
import { FullBleed } from '../../components/layout/FullBleed';

/** Long-scroll marketing home for guests & admins on `/`. Protected CTAs → `/login`; sign-up → `/register`; `/about` stays public. */
const PublicLandingContent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goLogin = () => navigate('/login');

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-0 pb-0">
      <FullBleed className="min-h-[85vh]">
        <div className="relative flex min-h-[85vh] flex-col justify-end overflow-hidden bg-slate-950 md:justify-center">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-16 pt-24 md:pb-24 md:pt-32">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-200 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-300" />
              QuestManager
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
              {t('public_home.hero_title')}
            </h1>
            <p className="max-w-2xl text-lg font-medium text-slate-200 md:text-xl">{t('public_home.hero_subtitle')}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="rounded-2xl px-8 shadow-lg shadow-primary-500/30" onClick={goLogin}>
                {t('home_scroll.cta_quests')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <button
                type="button"
                onClick={() => scrollToId('public-section-stats')}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                {t('home_scroll.cta_explore')}
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </FullBleed>

      <FullBleed
        id="public-section-stats"
        className="border-y border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px bg-slate-200 sm:grid-cols-3 dark:bg-slate-700">
          <div className="flex flex-col items-center justify-center bg-white px-6 py-10 text-center dark:bg-slate-900">
            <Coins className="mb-3 h-8 w-8 text-amber-500" />
            <p className="text-3xl font-black text-slate-900 dark:text-white">{t('public_home.stat_wallet_value')}</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-wider text-slate-500">
              {t('public_home.stat_wallet_label')}
            </p>
            <p className="mt-2 text-xs text-slate-400">{t('public_home.stat_wallet_hint')}</p>
          </div>
          <div className="flex flex-col items-center justify-center bg-white px-6 py-10 text-center dark:bg-slate-900">
            <Target className="mb-3 h-8 w-8 text-primary-500" />
            <p className="text-3xl font-black text-slate-900 dark:text-white">{t('public_home.stat_missions_value')}</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-wider text-slate-500">
              {t('public_home.stat_missions_label')}
            </p>
            <p className="mt-2 text-xs text-slate-400">{t('public_home.stat_missions_hint')}</p>
          </div>
          <div className="flex flex-col items-center justify-center bg-white px-6 py-10 text-center dark:bg-slate-900">
            <Award className="mb-3 h-8 w-8 text-violet-500" />
            <p className="text-3xl font-black text-slate-900 dark:text-white">{t('public_home.stat_ach_value')}</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-wider text-slate-500">
              {t('public_home.stat_ach_label')}
            </p>
            <p className="mt-2 text-xs text-slate-400">{t('public_home.stat_ach_hint')}</p>
          </div>
        </div>
      </FullBleed>

      <FullBleed className="bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="order-2 md:order-1">
            <span className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
              {t('home_scroll.tag_quests')}
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
              {t('home_scroll.quests_title')}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">{t('home_scroll.quests_body')}</p>
            <Button className="mt-8 rounded-2xl" onClick={goLogin}>
              {t('home_scroll.quests_cta')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="order-1 overflow-hidden rounded-3xl shadow-2xl shadow-slate-900/20 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
              alt=""
              className="h-72 w-full object-cover transition duration-700 hover:scale-105 md:h-96"
            />
          </div>
        </div>
      </FullBleed>

      <FullBleed className="bg-white dark:bg-slate-900">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="overflow-hidden rounded-3xl shadow-2xl shadow-slate-900/15">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop"
              alt=""
              className="h-72 w-full object-cover transition duration-700 hover:scale-105 md:h-96"
            />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {t('home_scroll.tag_progress')}
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
              {t('home_scroll.progress_title')}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">{t('home_scroll.progress_body')}</p>
            <Button variant="secondary" className="mt-8 rounded-2xl" onClick={goLogin}>
              <TrendingUp className="mr-2 h-4 w-4" />
              {t('home_scroll.progress_cta')}
            </Button>
          </div>
        </div>
      </FullBleed>

      <FullBleed className="bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/20 dark:to-slate-950">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="order-2 md:order-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {t('home_scroll.tag_achievements')}
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
              {t('home_scroll.achievements_title')}
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">{t('home_scroll.achievements_body')}</p>
            <Button className="mt-8 rounded-2xl bg-amber-600 hover:bg-amber-700" onClick={goLogin}>
              <Award className="mr-2 h-4 w-4" />
              {t('home_scroll.achievements_cta')}
            </Button>
          </div>
          <div className="order-1 overflow-hidden rounded-3xl shadow-2xl md:order-2">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop"
              alt=""
              className="h-72 w-full object-cover transition duration-700 hover:scale-105 md:h-96"
            />
          </div>
        </div>
      </FullBleed>

      <FullBleed className="bg-slate-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:gap-16 md:py-28">
          <div className="overflow-hidden rounded-3xl ring-1 ring-white/10">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop"
              alt=""
              className="h-72 w-full object-cover opacity-95 transition duration-700 hover:scale-105 md:h-96"
            />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-violet-300">
              {t('home_scroll.tag_shop')}
            </span>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">{t('home_scroll.shop_title')}</h2>
            <p className="mt-4 text-slate-300 leading-relaxed">{t('home_scroll.shop_body')}</p>
            <Button className="mt-8 rounded-2xl bg-violet-600 hover:bg-violet-700" onClick={goLogin}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              {t('home_scroll.shop_cta')}
            </Button>
          </div>
        </div>
      </FullBleed>

      <FullBleed className="border-t border-slate-200 bg-primary-600 text-white dark:border-slate-800 dark:bg-primary-700">
        <div className="mx-auto max-w-6xl px-6 py-20 md:flex md:items-center md:justify-between md:py-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Zap className="h-4 w-4" />
              {t('home_scroll.tag_topup')}
            </div>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">{t('home_scroll.topup_title')}</h2>
            <p className="mt-3 text-primary-100 leading-relaxed">{t('home_scroll.topup_body')}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 md:mt-0 md:justify-end">
            <Button
              variant="ghost"
              className="rounded-2xl border-2 border-white/40 bg-white/10 text-white hover:bg-white/20"
              onClick={goLogin}
            >
              {t('home_scroll.topup_profile')}
            </Button>
            <Button className="rounded-2xl bg-white text-black hover:bg-slate-100" onClick={() => navigate('/about')}>
              {t('home_scroll.topup_about')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </FullBleed>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const isCustomer = isAuthenticated && user?.roleName !== 'ADMIN';

  if (isCustomer) {
    return <CustomerHomePage />;
  }

  return <PublicLandingContent />;
};

export default LandingPage;
