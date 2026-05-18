import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useTranslation } from 'react-i18next';
import { useGetMyWalletQuery } from '../../store/api/wallet/walletApi';
import { useGetPublicItemsQuery, useGetMyUserItemsQuery, useBuyItemMutation } from '../../store/api/item/itemApi';
import type { ItemDto } from '../../types/item';
import { ShoppingBag, Coins, Check, History } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../../utils/errorMessage';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop';

type ShopTab = 'catalog' | 'history';

const ShopCustomerPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((s: RootState) => s.auth.user);
  const [tab, setTab] = useState<ShopTab>('catalog');
  const { data: wallet, isLoading: walletLoading } = useGetMyWalletQuery();
  const { data: itemsPage, isLoading: itemsLoading } = useGetPublicItemsQuery({ page: 0, size: 100 });
  const { data: myItemsPage, isLoading: myItemsLoading } = useGetMyUserItemsQuery(
    { page: 0, size: 200 },
    { skip: !user }
  );
  const [buyItem, { isLoading: buying }] = useBuyItemMutation();

  const ownedByItemId = useMemo(() => {
    const m = new Map<number, number>();
    myItemsPage?.content.forEach((row) => {
      m.set(row.itemId, (m.get(row.itemId) ?? 0) + 1);
    });
    return m;
  }, [myItemsPage]);

  const historyRows = useMemo(() => {
    const rows = [...(myItemsPage?.content ?? [])];
    rows.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    return rows;
  }, [myItemsPage]);

  const serverPoints = wallet?.points ?? 0;

  const handleBuy = async (itemId: number, name: string, price: number) => {
    if (!user) return;
    try {
      await buyItem(itemId).unwrap();
      toast.success(t('toast.shop_purchase_success_live', { item: name, points: price }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('toast.shop_purchase_failed')));
    }
  };

  const requestPurchase = (item: ItemDto) => {
    if (!user || serverPoints < item.price) return;
    const ok = window.confirm(
      t('shop.purchase_confirm', { name: item.name, price: item.price })
    );
    if (!ok) return;
    void handleBuy(item.id, item.name, item.price);
  };

  const loading = walletLoading || itemsLoading;
  const tabs: { id: ShopTab; label: string; icon: typeof ShoppingBag }[] = [
    { id: 'catalog', label: t('shop.tab_catalog'), icon: ShoppingBag },
    { id: 'history', label: t('shop.tab_history'), icon: History },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('shop.title')}</h1>
            <p className="mt-1 font-medium text-slate-600 dark:text-slate-400">{t('shop.subtitle_live')}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/40">
          <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800/80 dark:text-amber-200/80">
              {t('shop.balance_live')}
            </p>
            <p className="text-xl font-black text-amber-950 dark:text-amber-100">
              {loading ? '…' : serverPoints}
              <span className="ml-1 text-sm font-semibold opacity-80">{t('profile.points')}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              tab === id
                ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-800 dark:text-primary-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : !itemsPage?.content.length ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              {t('shop.empty_catalog')}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {itemsPage.content.map((item) => {
                const ownedCount = ownedByItemId.get(item.id) ?? 0;
                const owned = ownedCount > 0;
                const img = item.imageLink?.trim() || PLACEHOLDER_IMG;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                      <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <span className="text-lg font-black text-primary-600 dark:text-primary-400">
                          {item.price} <span className="text-xs font-bold">{t('profile.points')}</span>
                        </span>
                        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                          {owned ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                              <Check className="h-3.5 w-3.5" />
                              {t('shop.owned')}
                              {ownedCount > 1 ? ` ×${ownedCount}` : ''}
                            </span>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-xl"
                            isLoading={buying}
                            onClick={() => requestPurchase(item)}
                            disabled={serverPoints < item.price}
                          >
                            {owned ? t('shop.buy_again') : t('shop.buy')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {myItemsLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : historyRows.length === 0 ? (
            <p className="p-8 text-center text-slate-500">{t('shop.history_empty')}</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {historyRows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{row.itemName}</p>
                    <p className="text-xs text-slate-500">
                      {t('shop.history_order_id', { id: row.id })} · {t('shop.history_item_id', { id: row.itemId })}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {new Date(row.purchaseDate).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopCustomerPage;
