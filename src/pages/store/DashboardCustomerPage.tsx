import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useGetMeQuery } from '../../store/api/user/userApi';
import { useGetMyWalletQuery } from '../../store/api/wallet/walletApi';
import { Target, CheckCircle, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardCustomerPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading: isProfileLoading } = useGetMeQuery();
  const { data: wallet, isLoading: isWalletLoading } = useGetMyWalletQuery();
  const navigate = useNavigate();

  React.useEffect(() => {
    const isAdmin = user?.roleName?.toUpperCase().includes('ADMIN');
    if (isAdmin) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const stats = [
    { label: 'Available Missions', value: '12', icon: Target, color: 'bg-blue-500' },
    { label: 'Completed', value: '5', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'In Progress', value: '3', icon: Clock, color: 'bg-amber-500' },
    { label: 'Total Points', value: wallet?.points || '0', icon: Award, color: 'bg-purple-500' },
  ];

  if (isProfileLoading || isWalletLoading) {
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
          Welcome back, <span className="text-primary-600">{user?.fullName}</span>! 👋
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
          Here's an overview of your mission progress and achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-transform hover:scale-105 duration-300">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} rounded-xl p-3 text-white shadow-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-8 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-1 h-3 w-3 rounded-full bg-primary-500 shrink-0"></div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    You completed the mission "Survey: Customer Happiness"
                  </p>
                  <p className="text-xs text-slate-500">2 hours ago • +50 Points earned</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full rounded-xl border-2 border-slate-100 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
            View all activities
          </button>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4">Master Your Quests</h2>
            <p className="text-primary-100 text-sm leading-relaxed">
              Unlock exclusive rewards and level up your profile by completing special limited-time missions.
            </p>
          </div>
          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider">
              <span>Next Level XP</span>
              <span>75%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white w-[75%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>
          <button className="mt-8 w-full rounded-xl bg-white py-3 text-sm font-bold text-primary-600 hover:shadow-lg transition-all active:scale-95">
            Explore Specials
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCustomerPage;
