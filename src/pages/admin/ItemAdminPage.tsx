import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  useGetAdminItemsQuery,
  useCreateAdminItemMutation,
  useUpdateAdminItemMutation,
  useDeleteAdminItemMutation,
  type AdminItemSaveBody,
} from '../../store/api/admin/adminApi';
import type { ItemDto } from '../../types/item';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useObjectUrlPreview } from '../../hooks/useObjectUrlPreview';

type ItemFormValues = {
  name: string;
  description: string;
  price: number;
  imageLink: string;
  isAvailable: boolean;
};

function buildItemPayload(data: ItemFormValues, opts?: { omitImageLink?: boolean }): AdminItemSaveBody {
  const payload: AdminItemSaveBody = {
    name: data.name.trim(),
    description: data.description.trim(),
    price: data.price,
    isAvailable: data.isAvailable,
  };
  const img = data.imageLink?.trim();
  if (!opts?.omitImageLink && img) payload.imageLink = img;
  return payload;
}

const ItemAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const isAdmin = useSelector((s: RootState) => s.auth.user?.roleName === 'ADMIN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDto | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const coverPreview = useObjectUrlPreview(coverImage);

  const { data: itemsPage, isLoading } = useGetAdminItemsQuery(
    { page: 0, size: 50 },
    { skip: !isAdmin }
  );
  const [createItem] = useCreateAdminItemMutation();
  const [updateItem] = useUpdateAdminItemMutation();
  const [deleteItem] = useDeleteAdminItemMutation();

  const { register, handleSubmit, reset, setValue } = useForm<ItemFormValues>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageLink: '',
      isAvailable: true,
    },
  });

  const displayCover = coverPreview || editingItem?.imageLink?.trim() || '';

  const handleOpenModal = (item?: ItemDto) => {
    setCoverImage(null);
    if (item) {
      setEditingItem(item);
      setValue('name', item.name);
      setValue('description', item.description);
      setValue('price', item.price);
      setValue('imageLink', item.imageLink ?? '');
      setValue('isAvailable', item.isAvailable);
    } else {
      setEditingItem(null);
      reset({
        name: '',
        description: '',
        price: 0,
        imageLink: '',
        isAvailable: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCoverImage(null);
  };

  const onSubmit = async (data: ItemFormValues) => {
    const omitLink = !!(coverImage && coverImage.size > 0);
    const body = buildItemPayload(data, { omitImageLink: omitLink });
    try {
      if (editingItem) {
        await updateItem({ id: editingItem.id, item: body, image: coverImage }).unwrap();
        toast.success(t('toast.admin_item_updated'));
      } else {
        await createItem({ item: body, image: coverImage }).unwrap();
        toast.success(t('toast.admin_item_created'));
      }
      closeModal();
      reset();
    } catch (err) {
      console.error(err);
      toast.error(t('toast.admin_item_failed'));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('admin_items.delete_confirm'))) {
      try {
        await deleteItem(id).unwrap();
        toast.success(t('toast.admin_item_deleted'));
      } catch (err) {
        console.error(err);
        toast.error(t('toast.admin_item_failed'));
      }
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('admin_items.title')}</h1>
          <p className="mt-2 font-medium text-slate-500 dark:text-slate-400">{t('admin_items.subtitle')}</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-primary-500/30">
          <Plus className="mr-2 h-5 w-5" />
          {t('admin_items.create')}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('admin_items.col_product')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('admin_items.col_price')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('admin_items.col_status')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('admin_items.col_actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {itemsPage?.content.map((item) => (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex max-w-md items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                        {item.imageLink ? (
                          <img src={item.imageLink} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-bold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="line-clamp-1 text-xs text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary-600">+{item.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.isAvailable
                          ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {item.isAvailable ? t('admin_items.active') : t('admin_items.hidden')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
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
        {itemsPage?.content.length === 0 && (
          <p className="p-8 text-center text-slate-500">{t('admin_items.empty')}</p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? t('admin_items.modal_edit') : t('admin_items.modal_create')}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label={t('admin_items.label_name')} register={register('name')} required />
          <Input label={t('admin_items.label_description')} register={register('description')} required />
          <Input
            label={t('admin_items.label_price')}
            type="number"
            register={register('price', { valueAsNumber: true })}
            required
          />

          <div className="flex items-center gap-2">
            <input type="checkbox" id="item-available" {...register('isAvailable')} className="h-4 w-4 rounded" />
            <label htmlFor="item-available" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('admin_items.label_available')}
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('admin_items.label_image_upload')}
            </label>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100 dark:text-slate-400"
              onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-slate-500">{t('admin_items.image_help')}</p>
            {displayCover ? (
              <div className="mt-2">
                <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t('common.image_preview')}
                </p>
                <img
                  src={displayCover}
                  alt=""
                  className="max-h-44 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                />
              </div>
            ) : null}
          </div>

          <Input label={t('admin_items.label_image_link')} register={register('imageLink')} />

          <div className="mt-8 flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              {t('admin_items.cancel')}
            </Button>
            <Button type="submit">{editingItem ? t('admin_items.save') : t('admin_items.create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ItemAdminPage;
