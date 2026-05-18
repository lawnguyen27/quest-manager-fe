import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { 
  useGetAdminUsersQuery, 
  useGetAdminMissionsQuery, 
  useGetAdminUserMissionsQuery,
  useGetAdminAllUserItemsQuery,
} from '../../store/api/admin/adminApi';
import { 
  Users, 
  Briefcase, 
  ClipboardList, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardAdminPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.roleName === 'ADMIN';

  // Fetching real data for counts (skip if not ADMIN — backend requires ROLE_ADMIN)
  const { data: users = [] } = useGetAdminUsersQuery(undefined, { skip: !isAdmin });
  const { data: missionsPage } = useGetAdminMissionsQuery(
    { page: 0, size: 1 },
    { skip: !isAdmin }
  );
  const { data: trackingPage } = useGetAdminUserMissionsQuery(
    { page: 0, size: 5 },
    { skip: !isAdmin }
  );
  const { data: userItemsPage } = useGetAdminAllUserItemsQuery(
    { page: 0, size: 1 },
    { skip: !isAdmin }
  );

  const stats = [
    { 
      label: 'Total Users', 
      value: users.length.toString(), 
      icon: Users, 
      color: 'bg-blue-600',
      link: '/admin/users'
    },
    { 
      label: 'Total Missions', 
      value: missionsPage?.totalElements.toString() || '0', 
      icon: Briefcase, 
      color: 'bg-indigo-600',
      link: '/admin/missions'
    },
    { 
      label: 'Total Assignments', 
      value: trackingPage?.totalElements.toString() || '0', 
      icon: ClipboardList, 
      color: 'bg-emerald-600',
      link: '/admin/tracking'
    },
    { 
      label: 'Shop purchase lines', 
      value: userItemsPage?.totalElements.toString() || '0', 
      icon: ShoppingBag, 
      color: 'bg-amber-600',
      link: '/admin/orders'
    },
    { 
      label: 'System Status', 
      value: 'All Systems Go', 
      icon: ShieldCheck, 
      color: 'bg-rose-600',
      link: '#'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Admin Portal <span className="text-primary-600 font-medium text-lg ml-2">v1.2.0</span>
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
          Welcome, <span className="text-slate-900 dark:text-white">{user?.fullName}</span>. Monitor system activity and manage resources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link 
            key={stat.label} 
            to={stat.link}
            className="group overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} rounded-xl p-3 text-white shadow-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-8 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-500" />
              Recent Assignments
            </h2>
            <Link to="/admin/tracking" className="text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          
          <div className="space-y-6">
            {trackingPage?.content.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                    {item.userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.userEmail}
                    </p>
                    <p className="text-xs text-slate-500">
                      Joined <span className="font-semibold text-slate-700">{item.missionName}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                    item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
            {!trackingPage?.content.length && (
              <p className="text-center py-8 text-slate-400 text-sm">No recent assignments found.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-32 w-32 -mr-16 -mt-16 rounded-full bg-primary-500/20 group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3 relative z-10">
              <Link to="/admin/missions" className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
                <PlusIcon className="h-4 w-4" />
                Create New Mission
              </Link>
              <Link to="/admin/users" className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
                <UsersIcon className="h-4 w-4" />
                Manage User Roles
              </Link>
            </div>
          </div>
          
          <div className="rounded-2xl bg-white p-8 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">System Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Database synchronized</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">3 missions expiring soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlusIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 4v16m8-8H4" />
  </svg>
);

const UsersIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default DashboardAdminPage;
