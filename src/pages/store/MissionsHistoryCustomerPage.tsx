import React from 'react';
import { useGetMyUserMissionsQuery, useUpdateUserMissionStatusMutation } from '../../store/api/mission/missionApi';
import { History, CheckCircle, Clock, XCircle, Play } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const MissionsHistoryCustomerPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: userMissionsPage, isLoading } = useGetMyUserMissionsQuery({ page: 0, size: 50 });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateUserMissionStatusMutation();

  const myMissions = userMissionsPage?.content ?? [];

  const openWatchTab = (userMissionId: number) => {
    window.open(`${window.location.origin}/missions/watch/${userMissionId}`, '_blank', 'noopener,noreferrer');
  };

  const handleComplete = async (id: number) => {
    try {
      await updateStatus({ id, status: 'COMPLETED' }).unwrap();
      toast.success(t('toast.mission_marked_complete'));
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(t('toast.mission_mark_complete_failed'));
    }
  };

  const statusConfig = {
    PROCESSING: { color: 'text-amber-600 bg-amber-50', icon: Clock, label: 'In Progress' },
    COMPLETED: { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'Completed' },
    CANCELLED: { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'Cancelled' },
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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          My Mission Progress
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
          Track the status of missions you&apos;ve joined. Video missions: open Watch and finish the video to earn points.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mission</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Joined Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Points</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {myMissions.map((mission) => {
                const config = statusConfig[mission.status as keyof typeof statusConfig] || statusConfig.PROCESSING;
                const hasVideo = !!mission.videoUrl?.trim();
                return (
                  <tr key={mission.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{mission.missionName}</p>
                      <p className="text-xs text-slate-400">ID: #{mission.missionId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(mission.receivedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.color}`}>
                        <config.icon className="h-3.5 w-3.5" />
                        {config.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {mission.points > 0 ? `+${mission.points}` : mission.points}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {mission.status === 'PROCESSING' && hasVideo && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => openWatchTab(mission.id)}
                        >
                          <Play className="mr-1.5 h-3.5 w-3.5" />
                          Watch
                        </Button>
                      )}
                      {mission.status === 'PROCESSING' && !hasVideo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => handleComplete(mission.id)}
                          isLoading={isUpdating}
                        >
                          Complete
                        </Button>
                      )}
                      {mission.status === 'COMPLETED' && (
                        <span className="text-xs font-medium text-slate-400 italic">
                          Done {mission.completedAt ? new Date(mission.completedAt).toLocaleDateString() : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {myMissions.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
              <History className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Empty Progress</h3>
            <p className="text-slate-500">You haven&apos;t joined any missions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionsHistoryCustomerPage;
