import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { 
  useGetAdminMissionsQuery, 
  useCreateAdminMissionMutation, 
  useUpdateAdminMissionMutation, 
  useDeleteAdminMissionMutation 
} from '../../store/api/admin/adminApi';
import type { MissionDto } from '../../types/mission';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useObjectUrlPreview } from '../../hooks/useObjectUrlPreview';

/** `datetime-local` / ISO → Instant-compatible UTC string, or omit if empty / invalid. */
function toApiInstant(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  if (s === '') return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** API ISO instant → value for `<input type="datetime-local" />` (local). */
function isoToDatetimeLocal(iso: string | undefined): string | undefined {
  if (!iso?.trim()) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildMissionPayload(
  data: MissionDto,
  opts?: { omitImageLink?: boolean }
): Omit<MissionDto, 'id'> & { id?: number } {
  const payload: Omit<MissionDto, 'id'> & { id?: number } = {
    name: data.name,
    description: data.description,
    missionType: data.missionType,
    missionStatus: data.missionStatus,
    points: data.points,
  };
  const img = data.imageLink?.trim();
  const doc = data.documentLink?.trim();
  const vid = data.videoUrl?.trim();
  if (!opts?.omitImageLink && img) payload.imageLink = img;
  if (doc) payload.documentLink = doc;
  if (vid) payload.videoUrl = vid;
  const from = toApiInstant(data.fromDate);
  const to = toApiInstant(data.toDate);
  if (from) payload.fromDate = from;
  if (to) payload.toDate = to;
  if (typeof data.id === 'number' && !Number.isNaN(data.id)) {
    payload.id = data.id;
  }
  return payload;
}

const MissionAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const isAdmin = useSelector((s: RootState) => s.auth.user?.roleName === 'ADMIN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<MissionDto | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const coverPreview = useObjectUrlPreview(coverImage);
  const { data: missionsPage, isLoading } = useGetAdminMissionsQuery(
    { page: 0, size: 20 },
    { skip: !isAdmin }
  );
  const [createMission] = useCreateAdminMissionMutation();
  const [updateMission] = useUpdateAdminMissionMutation();
  const [deleteMission] = useDeleteAdminMissionMutation();

  const { register, handleSubmit, reset, setValue } = useForm<MissionDto>();

  const missionCoverDisplay =
    coverPreview || (editingMission?.imageLink?.trim() ? editingMission.imageLink.trim() : '');

  const handleOpenModal = (mission?: MissionDto) => {
    setCoverImage(null);
    if (mission) {
      setEditingMission(mission);
      setValue('name', mission.name);
      setValue('description', mission.description);
      setValue('missionType', mission.missionType);
      setValue('missionStatus', mission.missionStatus);
      setValue('points', mission.points);
      setValue('fromDate', isoToDatetimeLocal(mission.fromDate) ?? '');
      setValue('toDate', isoToDatetimeLocal(mission.toDate) ?? '');
      setValue('imageLink', mission.imageLink ?? '');
      setValue('documentLink', mission.documentLink ?? '');
      setValue('videoUrl', mission.videoUrl ?? '');
    } else {
      setEditingMission(null);
      reset({
        missionType: 'VIDEO',
        missionStatus: 'ACTIVE',
        points: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCoverImage(null);
  };

  const onSubmit = async (data: MissionDto) => {
    const body = buildMissionPayload(
      { ...data, id: editingMission?.id ?? data.id },
      { omitImageLink: !!(coverImage && coverImage.size > 0) }
    );
    const { id: _drop, ...missionJson } = body;
    try {
      if (editingMission) {
        await updateMission({
          id: editingMission.id,
          mission: missionJson,
          image: coverImage,
        }).unwrap();
        toast.success(t('toast.admin_mission_updated'));
      } else {
        await createMission({ mission: missionJson, image: coverImage }).unwrap();
        toast.success(t('toast.admin_mission_created'));
      }
      closeModal();
      reset();
    } catch (err) {
      console.error('Operation failed:', err);
      toast.error(t('toast.admin_mission_failed'));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this mission?')) {
      try {
        await deleteMission(id).unwrap();
        toast.success(t('toast.admin_mission_deleted'));
      } catch (err) {
        console.error('Delete failed:', err);
        toast.error(t('toast.admin_mission_failed'));
      }
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Mission Management</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
            Create and manage missions for your users.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-primary-500/30">
          <Plus className="mr-2 h-5 w-5" />
          Create Mission
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mission Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Points</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {missionsPage?.content.map((mission) => (
                <tr key={mission.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{mission.name}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{mission.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {mission.missionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary-600">
                    +{mission.points}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      mission.missionStatus === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {mission.missionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(mission)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(mission.id)}
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
        onClose={closeModal}
        title={editingMission ? 'Edit Mission' : 'Create New Mission'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Mission Name" register={register('name')} required />
          <Input label="Description" register={register('description')} required />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Type</label>
              <select {...register('missionType')} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
              </select>
            </div>
            <Input label="Points" type="number" register={register('points', { valueAsNumber: true })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="From Date" type="datetime-local" register={register('fromDate')} />
            <Input label="To Date" type="datetime-local" register={register('toDate')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select {...register('missionStatus')} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Cover image (upload) / Ảnh bìa
            </label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100 dark:text-slate-400"
              onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-slate-500">
              Uploaded to cloud storage; URL is saved on the mission. Leave empty to keep the current image or use link below.
            </p>
            {missionCoverDisplay ? (
              <div className="mt-2">
                <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t('common.image_preview')}
                </p>
                <img
                  src={missionCoverDisplay}
                  alt=""
                  className="max-h-44 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                />
              </div>
            ) : null}
          </div>
          <Input label="Image Link (optional fallback)" register={register('imageLink')} />
          <Input label="Document Link" register={register('documentLink')} />
          <Input
            label="YouTube URL (video mission)"
            register={register('videoUrl')}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-slate-500">
            Users open this in a new tab; reward is granted when the video ends (embedded player).
          </p>

          <div className="mt-8 flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit">
              {editingMission ? 'Update Mission' : 'Create Mission'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MissionAdminPage;
