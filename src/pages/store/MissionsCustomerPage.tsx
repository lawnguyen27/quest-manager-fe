import React, { useMemo } from 'react';
import {
  useGetMissionsQuery,
  useCreateUserMissionMutation,
  useGetMyUserMissionsQuery,
} from '../../store/api/mission/missionApi';
import { Target, Calendar, Award, ExternalLink, ChevronRight, Play } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import type { MissionDto, UserMissionDto } from '../../types/mission';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const MissionsCustomerPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: missionsPage, isLoading } = useGetMissionsQuery({ page: 0, size: 10 });
  const [createUserMission, { isLoading: isJoining }] = useCreateUserMissionMutation();
  const { data: myMissionsPage } = useGetMyUserMissionsQuery(
    { page: 0, size: 100 },
    { skip: !isAuthenticated }
  );
  const navigate = useNavigate();

  /** One row per mission; if duplicates, prefer COMPLETED over PROCESSING. */
  const userMissionByMissionId = useMemo(() => {
    const map = new Map<number, UserMissionDto>();
    myMissionsPage?.content.forEach((um) => {
      const prev = map.get(um.missionId);
      if (!prev) {
        map.set(um.missionId, um);
        return;
      }
      if (prev.status === 'COMPLETED') return;
      if (um.status === 'COMPLETED') {
        map.set(um.missionId, um);
      }
    });
    return map;
  }, [myMissionsPage]);

  const { ongoingMissions, completedMissions } = useMemo(() => {
    const list = missionsPage?.content ?? [];
    const ongoing: MissionDto[] = [];
    const completed: MissionDto[] = [];
    list.forEach((mission) => {
      const um = userMissionByMissionId.get(mission.id);
      if (um?.status === 'COMPLETED') completed.push(mission);
      else ongoing.push(mission);
    });
    return { ongoingMissions: ongoing, completedMissions: completed };
  }, [missionsPage?.content, userMissionByMissionId]);

  const openWatchTab = (userMissionId: number) => {
    window.open(`${window.location.origin}/missions/watch/${userMissionId}`, '_blank', 'noopener,noreferrer');
  };

  const handleJoinMission = async (missionId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const joined = await createUserMission({ missionId }).unwrap();
      toast.success(t('mission_list.join_success'));
      if (joined.videoUrl?.trim()) {
        openWatchTab(joined.id);
      }
    } catch (err) {
      console.error('Failed to join mission:', err);
      toast.error(t('mission_list.join_failed'));
    }
  };

  const renderMissionCard = (mission: MissionDto) => {
    const um = userMissionByMissionId.get(mission.id);
    const isCompleted = um?.status === 'COMPLETED';
    const isProcessing = um?.status === 'PROCESSING';
    return (
      <div
        key={mission.id}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:hover:shadow-xl transition-all duration-500"
      >
        <div className="relative h-48 w-full overflow-hidden sm:h-auto sm:w-48">
          <img
            src={
              mission.imageLink ||
              `https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=500&auto=format&fit=crop`
            }
            alt={mission.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute left-3 top-3">
            <span className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary-700 backdrop-blur-md dark:bg-slate-900/90 dark:text-primary-400">
              {mission.missionType}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">{mission.name}</h3>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 dark:bg-amber-900/20">
              <Award className="h-3.5 w-3.5" />
              {mission.points}
            </div>
          </div>

          <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{mission.description}</p>

          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {t('mission_list.ends')}{' '}
                {mission.toDate ? new Date(mission.toDate).toLocaleDateString() : t('mission_list.no_end')}
              </span>
            </div>
            {mission.documentLink && (
              <a
                href={mission.documentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-primary-500 hover:text-primary-600"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t('mission_list.view_docs')}
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={isCompleted ? 'success' : 'primary'}
              className="min-w-0 flex-1 rounded-xl"
              onClick={() => handleJoinMission(mission.id)}
              isLoading={isJoining}
              disabled={isCompleted || isProcessing}
            >
              {isCompleted
                ? t('mission_list.completed')
                : isProcessing
                  ? t('mission_list.joined')
                  : t('mission_list.join')}
            </Button>
            {isProcessing && mission.videoUrl?.trim() && um && (
              <Button
                type="button"
                variant="secondary"
                className="flex-1 rounded-xl"
                onClick={() => openWatchTab(um.id)}
              >
                <Play className="mr-2 h-4 w-4" />
                {t('mission_list.watch_video')}
              </Button>
            )}
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-primary-600 dark:bg-slate-800 dark:text-slate-500"
              aria-hidden
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('mission_list.title')}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
            {t('mission_list.subtitle')}
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'DAILY', 'ONETIME', 'SPECIAL'].map((type) => (
            <button
              key={type}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                type === 'ALL'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {(missionsPage?.content.length ?? 0) === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
            <Target className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('mission_list.empty_title')}</h3>
          <p className="text-slate-500">{t('mission_list.empty_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <section className="rounded-2xl border border-primary-200/80 bg-primary-50/40 p-4 shadow-sm dark:border-primary-900/50 dark:bg-primary-950/20">
            <h2 className="border-b border-primary-200/60 pb-3 text-base font-extrabold uppercase tracking-wide text-primary-800 dark:border-primary-800/60 dark:text-primary-200">
              {t('mission_list.section_ongoing')}
            </h2>
            <div className="mt-4 space-y-4">
              {ongoingMissions.length === 0 ? (
                <p className="rounded-xl bg-white/80 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  {t('mission_list.empty_ongoing')}
                </p>
              ) : (
                ongoingMissions.map((m) => renderMissionCard(m))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <h2 className="border-b border-emerald-200/60 pb-3 text-base font-extrabold uppercase tracking-wide text-emerald-800 dark:border-emerald-800/60 dark:text-emerald-200">
              {t('mission_list.section_completed')}
            </h2>
            <div className="mt-4 space-y-4">
              {completedMissions.length === 0 ? (
                <p className="rounded-xl bg-white/80 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  {t('mission_list.empty_completed')}
                </p>
              ) : (
                completedMissions.map((m) => renderMissionCard(m))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default MissionsCustomerPage;
