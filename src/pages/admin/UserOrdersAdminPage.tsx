import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Package, ChevronLeft, ChevronRight, Search, Users, Receipt } from 'lucide-react';
import type { RootState } from '../../store';
import {
  useGetAdminAllUserItemsQuery,
  useGetAdminUserItemsByUserIdQuery,
} from '../../store/api/admin/adminApi';

const ALL_PAGE_SIZE = 15;
/** Load enough rows to build a usable warehouse summary for one user without extra round-trips */
const SINGLE_USER_FETCH_SIZE = 500;

function formatInstant(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const UserOrdersAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.roleName === 'ADMIN';
  const [searchParams, setSearchParams] = useSearchParams();
  const [userIdDraft, setUserIdDraft] = useState('');
  const [page, setPage] = useState(0);

  const userIdParam = searchParams.get('userId');
  const filteredUserId = userIdParam && /^\d+$/.test(userIdParam) ? Number(userIdParam) : null;

  React.useEffect(() => {
    setUserIdDraft(userIdParam ?? '');
    setPage(0);
  }, [userIdParam]);

  const { data: allPage, isLoading: loadingAll } = useGetAdminAllUserItemsQuery(
    { page, size: ALL_PAGE_SIZE },
    { skip: !isAdmin || filteredUserId != null }
  );

  const { data: userPage, isLoading: loadingUser } = useGetAdminUserItemsByUserIdQuery(
    { userId: filteredUserId!, page: 0, size: SINGLE_USER_FETCH_SIZE },
    { skip: !isAdmin || filteredUserId == null }
  );

  const isLoading =
    !isAdmin || (filteredUserId != null ? loadingUser : loadingAll);
  const data = filteredUserId != null ? userPage : allPage;

  const warehouseRows = useMemo(() => {
    if (!userPage?.content.length || filteredUserId == null) return [];
    const counts = new Map<number, { name: string; qty: number }>();
    userPage.content.forEach((row) => {
      const prev = counts.get(row.itemId);
      if (prev) prev.qty += 1;
      else counts.set(row.itemId, { name: row.itemName, qty: 1 });
    });
    return Array.from(counts.entries())
      .map(([itemId, v]) => ({ itemId, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [userPage, filteredUserId]);

  const applyUserFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = userIdDraft.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      setSearchParams({});
      return;
    }
    setSearchParams({ userId: trimmed });
  };

  const clearFilter = () => {
    setUserIdDraft('');
    setSearchParams({});
    setPage(0);
  };

  const totalPages = data?.totalPages ?? 0;
  const canPrev = filteredUserId == null && page > 0;
  const canNext = filteredUserId == null && page + 1 < totalPages;

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80 dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-gradient-to-bl from-violet-400/20 to-transparent blur-3xl dark:from-violet-600/15"
          aria-hidden
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/30">
              <ClipboardList className="h-7 w-7" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
                {t('admin_orders.hero_kicker')}
              </p>
              <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {t('admin_orders.title')}
              </h1>
              <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                {t('admin_orders.subtitle')}
              </p>
            </div>
          </div>

          <form
            onSubmit={applyUserFilter}
            className="w-full shrink-0 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-slate-100/80 p-1.5 dark:border-slate-700 dark:from-slate-800/60 dark:to-slate-900/90 lg:max-w-md xl:max-w-lg"
          >
            <div className="rounded-[calc(1rem-2px)] bg-white p-3 shadow-inner shadow-slate-200/60 dark:bg-slate-900 dark:shadow-none sm:flex sm:items-center sm:gap-2 sm:p-2 sm:px-3">
              <label htmlFor="admin-orders-user-id" className="sr-only">
                {t('admin_orders.filter_user')}
              </label>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  id="admin-orders-user-id"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={t('admin_orders.filter_placeholder')}
                  aria-label={t('admin_orders.filter_user')}
                  value={userIdDraft}
                  onChange={(e) => setUserIdDraft(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50 py-2.5 pl-10 pr-3 text-sm tabular-nums text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-[3px] focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary-500 dark:focus:bg-slate-800"
                />
              </div>
              <div className="mt-2 flex shrink-0 gap-2 sm:mt-0">
                <button
                  type="submit"
                  className="inline-flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-xl bg-gradient-to-b from-primary-600 to-primary-700 px-4 text-sm font-bold text-white shadow-md shadow-primary-600/25 ring-1 ring-inset ring-white/15 transition hover:brightness-105 active:brightness-95 sm:flex-initial sm:min-w-[6.75rem]"
                >
                  {t('admin_orders.apply')}
                </button>
                <button
                  type="button"
                  onClick={clearFilter}
                  className="inline-flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:flex-initial sm:min-w-[6.75rem]"
                >
                  {t('admin_orders.all_orders')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {filteredUserId != null && (
        <div className="overflow-hidden rounded-3xl border border-emerald-200/75 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/35 dark:via-slate-900 dark:to-slate-950">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-emerald-200/60 bg-white/60 px-5 py-4 backdrop-blur-sm dark:border-emerald-900/35 dark:bg-slate-900/40">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:bg-emerald-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/90 dark:text-emerald-400/90">
                  {t('admin_orders.filter_user')}
                </p>
                <p className="mt-1 text-base font-black text-emerald-950 dark:text-emerald-50">
                  {t('admin_orders.viewing_user', { id: filteredUserId })}
                </p>
              </div>
            </div>
            <Link
              to="/admin/users"
              className="inline-flex items-center rounded-xl bg-slate-900/5 px-3 py-2 text-xs font-bold text-primary-600 transition hover:bg-slate-900/10 dark:bg-white/10 dark:text-primary-300 dark:hover:bg-white/[0.14]"
            >
              {t('admin_orders.back_users')}
            </Link>
          </div>
          <div className="p-5">
            {warehouseRows.length > 0 ? (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
                    {t('admin_orders.warehouse_title')}
                  </span>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {warehouseRows.map((row) => (
                    <li
                      key={row.itemId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200/55 bg-white/90 px-3.5 py-3 text-sm shadow-sm dark:border-emerald-900/45 dark:bg-slate-800/60"
                    >
                      <span className="min-w-0 font-semibold text-slate-900 dark:text-slate-50">
                        <span className="line-clamp-2">{row.name}</span>
                        <span className="mt-0.5 block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          #{row.itemId}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-black tabular-nums text-emerald-900 shadow-inner dark:bg-emerald-950/70 dark:text-emerald-100">
                        ×{row.qty}
                      </span>
                    </li>
                  ))}
                </ul>
                {(userPage?.totalElements ?? 0) > SINGLE_USER_FETCH_SIZE ? (
                  <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950 dark:border-amber-900/45 dark:bg-amber-950/40 dark:text-amber-100">
                    {t('admin_orders.warehouse_truncated')}
                  </p>
                ) : null}
              </div>
            ) : !loadingUser ? (
              <p className="rounded-xl border border-dashed border-emerald-300/80 bg-emerald-50/30 px-4 py-6 text-center text-sm font-medium text-emerald-900/85 dark:border-emerald-800 dark:bg-transparent dark:text-emerald-200">
                {t('admin_orders.no_items_user')}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100/70 dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm dark:bg-primary-600">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {filteredUserId != null
                  ? `${t('admin_orders.filter_user')} #${filteredUserId}`
                  : t('admin_orders.all_orders')}
              </p>
              <p className="text-lg font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
                {data?.totalElements != null ? (data.totalElements ?? 0).toLocaleString() : '—'}
              </p>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex h-52 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-800/55">
                  <th className="whitespace-nowrap px-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {t('admin_orders.col_line_id')}
                  </th>
                  <th className="whitespace-nowrap px-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {t('admin_orders.col_user')}
                  </th>
                  <th className="min-w-[10rem] px-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {t('admin_orders.col_item')}
                  </th>
                  <th className="whitespace-nowrap px-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {t('admin_orders.col_price')}
                  </th>
                  <th className="whitespace-nowrap px-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {t('admin_orders.col_date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/90">
                {(data?.content ?? []).map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-primary-50/40 dark:hover:bg-slate-800/70"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      #{row.id}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {filteredUserId != null ? (
                        <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-slate-800">{row.userId}</span>
                      ) : (
                        <Link
                          to={`/admin/orders?userId=${row.userId}`}
                          className="inline-flex rounded-lg bg-primary-50 px-2 py-1 font-mono text-xs font-bold text-primary-700 underline-offset-2 transition hover:bg-primary-100 hover:underline dark:bg-primary-950/55 dark:text-primary-300 dark:hover:bg-primary-900/55"
                        >
                          {row.userId}
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-800 dark:text-slate-200">
                      <span className="font-bold text-slate-900 dark:text-white">{row.itemName}</span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-400 dark:text-slate-500">
                        item #{row.itemId}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                      {row.price != null ? row.price : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {formatInstant(row.purchaseDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.content.length && (
              <div className="border-t border-dashed border-slate-200 bg-slate-50/30 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('admin_orders.empty')}</p>
              </div>
            )}
          </div>
        )}

        {filteredUserId == null && (data?.totalPages ?? 0) > 1 ? (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t('admin_orders.page_info', {
                page: page + 1,
                total: data?.totalPages ?? 0,
                count: data?.totalElements ?? 0,
              })}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={!canPrev}
                aria-label="Previous page"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                disabled={!canNext}
                aria-label="Next page"
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserOrdersAdminPage;
