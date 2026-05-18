import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useGetAdminUsersQuery } from '../../store/api/admin/adminApi';
import {
  usePushNotificationMutation,
  usePushNotificationToAllMutation,
} from '../../store/api/public/notificationApi';
import { Link } from 'react-router-dom';
import { Users, Mail, Shield, MapPin, Search, Filter, Bell, Package } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/errorMessage';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const UserAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.roleName === 'ADMIN';
  const { data: users = [], isLoading } = useGetAdminUsersQuery(undefined, {
    skip: !isAdmin,
  });
  const [pushNotification, { isLoading: isPushing }] = usePushNotificationMutation();
  const [pushToAll, { isLoading: isPushingAll }] = usePushNotificationToAllMutation();
  const [selectedUser, setSelectedUser] = React.useState<{ id: number; fullName: string } | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState('INFO');
  const [submitError, setSubmitError] = React.useState('');

  const openNotifyModal = (userId: number, fullName: string) => {
    setSelectedUser({ id: userId, fullName });
    setTitle('');
    setMessage('');
    setType('INFO');
    setSubmitError('');
  };

  const closeNotifyModal = () => {
    setSelectedUser(null);
    setSubmitError('');
  };

  const handlePushToAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setSubmitError('Title and message are required.');
      return;
    }
    try {
      setSubmitError('');
      await pushToAll({
        title: title.trim(),
        message: message.trim(),
        type,
      }).unwrap();
      toast.success(t('toast.admin_notify_sent_all'));
      setShowBroadcastModal(false);
      setTitle('');
      setMessage('');
      setType('INFO');
    } catch (error) {
      const msg = getApiErrorMessage(error, t('toast.admin_notify_failed'));
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  const handlePushNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!title.trim() || !message.trim()) {
      setSubmitError('Title and message are required.');
      return;
    }

    try {
      setSubmitError('');
      await pushNotification({
        userId: selectedUser.id,
        title: title.trim(),
        message: message.trim(),
        type,
      }).unwrap();
      toast.success(t('toast.admin_notify_sent_user', { name: selectedUser.fullName }));
      closeNotifyModal();
    } catch (error) {
      const msg = getApiErrorMessage(error, t('toast.admin_notify_failed'));
      setSubmitError(msg);
      toast.error(msg);
    }
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">User Management</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
            Manage your application users and their roles.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setShowBroadcastModal(true);
              setTitle('');
              setMessage('');
              setType('INFO');
              setSubmitError('');
            }}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/30"
          >
            <Bell className="h-4 w-4" />
            Notify all customers
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="h-10 w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Location</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold dark:bg-slate-800 dark:text-slate-400">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 text-slate-300" />
                      {user.city || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      user.roleName === 'ADMIN' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      <Shield className="h-3.5 w-3.5" />
                      {user.roleName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {user.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        to={`/admin/orders?userId=${user.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/25"
                      >
                        <Package className="h-4 w-4" />
                        {t('nav.orders_admin')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => openNotifyModal(user.id, user.fullName)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                      >
                        <Bell className="h-4 w-4" />
                        Notify
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No users found</h3>
            <p className="text-slate-500">Adjust your search or filters.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showBroadcastModal}
        onClose={() => {
          setShowBroadcastModal(false);
          setSubmitError('');
        }}
        title="Broadcast to all customers (ROLE_USER)"
        size="sm"
      >
        <form className="space-y-4" onSubmit={handlePushToAll}>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sends only to accounts with role ROLE_USER (customer). Admins are excluded.
          </p>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Notification title"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Notification message"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
          {submitError && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{submitError}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setShowBroadcastModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPushingAll}>
              Send to all customers
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedUser}
        onClose={closeNotifyModal}
        title={selectedUser ? `Push notification to ${selectedUser.fullName}` : 'Push notification'}
        size="sm"
      >
        <form className="space-y-4" onSubmit={handlePushNotification}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Notification title"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Notification message"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
          {submitError && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{submitError}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={closeNotifyModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPushing}>
              Send
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserAdminPage;
