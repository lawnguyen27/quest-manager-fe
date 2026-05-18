import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useGetAdminUserMissionsQuery } from '../../store/api/admin/adminApi';
import { ClipboardList, User, Target, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

const UserMissionAdminPage: React.FC = () => {
  const isAdmin = useSelector((s: RootState) => s.auth.user?.roleName === 'ADMIN');
  const { data: userMissionsPage, isLoading } = useGetAdminUserMissionsQuery(
    { page: 0, size: 50 },
    { skip: !isAdmin }
  );

  const statusConfig = {
    PROCESSING: { color: 'text-amber-600 bg-amber-50', icon: Clock, label: 'Processing' },
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
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Mission Tracking Report</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
          View all user mission progress across the application.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mission</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Dates</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {userMissionsPage?.content.map((um) => {
                const config = statusConfig[um.status as keyof typeof statusConfig] || statusConfig.PROCESSING;
                return (
                  <tr key={um.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">#{um.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{um.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">{um.missionName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                        <config.icon className="h-3 w-3" />
                        {config.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-500 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined: {new Date(um.receivedAt).toLocaleDateString()}</span>
                      </div>
                      {um.completedAt && (
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="h-3 w-3" />
                          <span>Done: {new Date(um.completedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-mono font-bold text-amber-600">+{um.points} pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {userMissionsPage?.content.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
              <ClipboardList className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tracking data</h3>
            <p className="text-slate-500">Missions will appear here as users join them.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMissionAdminPage;
