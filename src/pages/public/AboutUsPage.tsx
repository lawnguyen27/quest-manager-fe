import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Gift, WalletCards, Mail } from 'lucide-react';

const AboutUsPage: React.FC = () => {
  const { t } = useTranslation();

  const blocks = [
    { icon: CalendarDays, title: t('about.section_missions_title'), body: t('about.section_missions_body') },
    { icon: Gift, title: t('about.section_redeem_title'), body: t('about.section_redeem_body') },
    { icon: WalletCards, title: t('about.section_topup_title'), body: t('about.section_topup_body') },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-12 pb-16">
      <header className="space-y-4 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{t('about.title')}</h1>
        <p className="text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-400">
          {t('about.subtitle')}
        </p>
        <p className="whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          {t('about.intro')}
        </p>
      </header>

      <div className="space-y-6">
        {blocks.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {body}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-dashed border-primary-300/60 bg-primary-50/50 p-6 dark:border-primary-800/50 dark:bg-primary-950/30">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t('about.contact_title')}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('about.contact_body')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
