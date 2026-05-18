import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  useGetAchievementsQuery,
  useGetMyUserAchievementsQuery,
  useJoinUserAchievementMutation,
} from '../../store/api/achievement/achievementApi';

/**
 * For each ACTIVE achievement, ensures a user_achievement row exists (POST join).
 * Runs after achievements + mine lists load; ignores duplicate errors from the API.
 */
function AchievementAutoEnroll() {
  const user = useSelector((s: RootState) => s.auth.user);
  const isCustomer = Boolean(user && user.roleName !== 'ADMIN');

  const { data: achPage, isSuccess: achOk } = useGetAchievementsQuery(
    { page: 0, size: 100 },
    { skip: !isCustomer }
  );
  const { data: minePage, isSuccess: mineOk } = useGetMyUserAchievementsQuery(
    { page: 0, size: 200 },
    { skip: !isCustomer }
  );
  const [join] = useJoinUserAchievementMutation();
  const enrolling = useRef(false);

  useEffect(() => {
    if (!isCustomer || !achOk || !mineOk || !achPage || !minePage || enrolling.current) return;

    const mineIds = new Set(minePage.content.map((m) => m.achievementId));
    const missing = achPage.content.filter(
      (a) => a.achievementStatus === 'ACTIVE' && !mineIds.has(a.id)
    );
    if (missing.length === 0) return;

    enrolling.current = true;
    let cancelled = false;

    void (async () => {
      try {
        for (const a of missing) {
          if (cancelled) break;
          try {
            await join({ achievementId: a.id }).unwrap();
          } catch {
            /* e.g. ACHIEVEMENT_ALREADY_ASSIGNED */
          }
        }
      } finally {
        enrolling.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isCustomer, achOk, mineOk, achPage, minePage, join]);

  return null;
}

export default AchievementAutoEnroll;
