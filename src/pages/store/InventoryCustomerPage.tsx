import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, ShoppingBag } from 'lucide-react';
import { useGetPublicItemsQuery, useGetMyUserItemsQuery } from '../../store/api/item/itemApi';
import type { ItemDto } from '../../types/item';
import type { RootState } from '../../store';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop';

const InventoryCustomerPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((s: RootState) => s.auth.user);
  const { data: itemsPage } = useGetPublicItemsQuery({ page: 0, size: 100 });
  const { data: myItemsPage, isLoading } = useGetMyUserItemsQuery(
    { page: 0, size: 200 },
    { skip: !user }
  );

  const itemById = useMemo(() => {
    const m = new Map<number, ItemDto>();
    itemsPage?.content.forEach((it) => m.set(it.id, it));
    return m;
  }, [itemsPage]);

  const inventoryRows = useMemo(() => {
    const counts = new Map<number, number>();
    myItemsPage?.content.forEach((row) => {
      counts.set(row.itemId, (counts.get(row.itemId) ?? 0) + 1);
    });
    const rows = Array.from(counts.entries()).map(([itemId, quantity]) => {
      const catalog = itemById.get(itemId);
      const fallbackName =
        myItemsPage?.content.find((r) => r.itemId === itemId)?.itemName ?? `#${itemId}`;
      return {
        itemId,
        quantity,
        name: catalog?.name ?? fallbackName,
        description: catalog?.description,
        imageLink: catalog?.imageLink,
      };
    });
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [myItemsPage, itemById]);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('inventory.title')}</h1>
            <p className="mt-1 font-medium text-slate-600 dark:text-slate-400">{t('inventory.subtitle')}</p>
            <Link
              to="/shop"
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:underline dark:text-primary-400"
            >
              <ShoppingBag className="h-4 w-4" />
              {t('inventory.go_shop')}
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : inventoryRows.length === 0 ? (
          <p className="p-8 text-center text-slate-500">{t('shop.inventory_empty')}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {inventoryRows.map((row) => {
              const img = row.imageLink?.trim() || PLACEHOLDER_IMG;
              return (
                <li key={row.itemId} className="flex items-center gap-4 px-4 py-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
                    {row.description ? (
                      <p className="line-clamp-2 text-sm text-slate-500">{row.description}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full bg-primary-100 px-3 py-1 text-sm font-black text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
                    ×{row.quantity}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InventoryCustomerPage;
