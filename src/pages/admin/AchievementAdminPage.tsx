import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  useGetAdminAchievementsQuery,
  useCreateAdminAchievementMutation,
  useUpdateAdminAchievementMutation,
  useDeleteAdminAchievementMutation,
} from '../../store/api/admin/adminApi';
import type { AchievementDto, AchievementStatus, AchievementType } from '../../types/achievement';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const ACHIEVEMENT_TYPES: AchievementType[] = [
  'LOGIN',
  'VERIFY_EMAIL',
  'VERIFY_PHONE',
  'UPLOAD_AVATAR',
  'MISSION',
  'POLICY',
];

const ACHIEVEMENT_STATUSES: AchievementStatus[] = ['ACTIVE', 'INACTIVE', 'EXPIRED'];

const AchievementAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const isAdmin = useSelector((s: RootState) => s.auth.user?.roleName === 'ADMIN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<AchievementDto | null>(null);
  const { data: page, isLoading } = useGetAdminAchievementsQuery(
    { page: 0, size: 50 },
    { skip: !isAdmin }
  );
  const [createAchievement] = useCreateAdminAchievementMutation();
  const [updateAchievement] = useUpdateAdminAchievementMutation();
  const [deleteAchievement] = useDeleteAdminAchievementMutation();

  const { register, handleSubmit, reset, setValue } = useForm<Omit<AchievementDto, 'id'> & { id?: number }>();

  const openCreate = () => {
    setEditing(null);
    reset({
      name: '',
      description: '',
      achievementType: 'LOGIN',
      achievementStatus: 'ACTIVE',
      points: 0,
    });
    setIsModalOpen(true);
  };

  const openEdit = (a: AchievementDto) => {
    setEditing(a);
    setValue('name', a.name);
    setValue('description', a.description);
    setValue('achievementType', a.achievementType);
    setValue('achievementStatus', a.achievementStatus);
    setValue('points', a.points);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Omit<AchievementDto, 'id'> & { id?: number }) => {
    try {
      if (editing) {
        await updateAchievement({
          id: editing.id,
          body: {
            name: data.name,
            description: data.description,
            achievementType: data.achievementType,
            achievementStatus: data.achievementStatus,
            points: data.points,
          },
        }).unwrap();
        toast.success(t('toast.admin_achievement_updated'));
      } else {
        await createAchievement({
          name: data.name,
          description: data.description,
          achievementType: data.achievementType,
          achievementStatus: data.achievementStatus,
          points: data.points,
        }).unwrap();
        toast.success(t('toast.admin_achievement_created'));
      }
      setIsModalOpen(false);
      reset();
    } catch (e) {
      console.error(e);
      toast.error(t('achievements.operation_failed'));
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm(t('achievements.delete_confirm'))) return;
    try {
      await deleteAchievement(id).unwrap();
      toast.success(t('toast.admin_achievement_deleted'));
    } catch (e) {
      console.error(e);
      toast.error(t('achievements.operation_failed'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('achievements.admin_title')}</h1>
          <p className="mt-2 font-medium text-slate-500 dark:text-slate-400">{t('achievements.admin_subtitle')}</p>
        </div>
        <Button onClick={openCreate} className="shadow-lg shadow-primary-500/30">
          <Plus className="mr-2 h-5 w-5" />
          {t('achievements.new')}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{t('achievements.col_name')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{t('achievements.col_type')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{t('achievements.col_points')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{t('achievements.col_status')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{t('achievements.col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {page?.content.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{a.name}</p>
                    <p className="line-clamp-1 text-xs text-slate-400">{a.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {a.achievementType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary-600">+{a.points}</td>
                  <td className="px-6 py-4 text-xs font-bold">{a.achievementStatus}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(a.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? t('achievements.modal_edit') : t('achievements.modal_create')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label={t('achievements.label_name')} register={register('name')} required />
          <Input label={t('achievements.label_description')} register={register('description')} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('achievements.label_type')}</label>
              <select
                {...register('achievementType')}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {ACHIEVEMENT_TYPES.map((achType) => (
                  <option key={achType} value={achType}>
                    {achType}
                  </option>
                ))}
              </select>
            </div>
            <Input label={t('achievements.label_points')} type="number" register={register('points', { valueAsNumber: true })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('achievements.label_status')}</label>
            <select
              {...register('achievementStatus')}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {ACHIEVEMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-8 flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              {t('achievements.cancel')}
            </Button>
            <Button type="submit">{editing ? t('achievements.update') : t('achievements.create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AchievementAdminPage;
