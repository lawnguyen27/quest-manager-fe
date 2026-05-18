import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useGetMyUserMissionByIdQuery,
  useUpdateUserMissionStatusMutation,
} from '../../store/api/mission/missionApi';
import { extractYoutubeVideoId } from '../../utils/youtube';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const PLAYER_DIV_ID = 'mission-yt-player';

const MissionWatchCustomerPage: React.FC = () => {
  const { t } = useTranslation();
  const { userMissionId } = useParams<{ userMissionId: string }>();
  const idNum = userMissionId ? parseInt(userMissionId, 10) : NaN;
  const skip = Number.isNaN(idNum);

  const { data: userMission, isLoading, isError } = useGetMyUserMissionByIdQuery(idNum, { skip });
  const [updateStatus, { isLoading: isCompleting }] = useUpdateUserMissionStatusMutation();

  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const completedRef = useRef(false);
  const playerRef = useRef<{ destroy: () => void } | null>(null);
  const userMissionRef = useRef(userMission);
  userMissionRef.current = userMission;

  const videoId = extractYoutubeVideoId(userMission?.videoUrl);

  const completeMission = useCallback(async () => {
    const um = userMissionRef.current;
    if (completedRef.current || !um || um.status !== 'PROCESSING') return;
    completedRef.current = true;
    try {
      await updateStatus({ id: um.id, status: 'COMPLETED' }).unwrap();
      const msg = t('toast.mission_completed_with_points', { points: um.points });
      setRewardMessage(msg);
      toast.success(msg);
    } catch {
      completedRef.current = false;
      const errMsg = t('toast.mission_mark_complete_failed');
      setPlayerError(errMsg);
      toast.error(errMsg);
    }
  }, [updateStatus, t]);

  useEffect(() => {
    if (!videoId || !userMission || userMission.status !== 'PROCESSING') return;

    const initPlayer = () => {
      if (!window.YT?.Player) return;
      try {
        playerRef.current?.destroy?.();
        playerRef.current = new window.YT.Player(PLAYER_DIV_ID, {
          videoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onStateChange: (e: { data: number }) => {
              if (e.data === 0) {
                void completeMission();
              }
            },
          },
        });
      } catch {
        setPlayerError('Không tải được trình phát YouTube. / Failed to load YouTube player.');
      }
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }

    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [videoId, userMission?.id, userMission?.status, completeMission]);

  if (skip) {
    return <p className="p-8 text-center text-slate-600">Invalid link. / Liên kết không hợp lệ.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isError || !userMission) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="text-slate-600">Không tìm thấy nhiệm vụ hoặc bạn không có quyền xem.</p>
        <p className="text-sm text-slate-500">Mission not found or access denied.</p>
        <Link to="/history" className="text-primary-600 font-semibold hover:underline">
          ← My missions
        </Link>
      </div>
    );
  }

  if (userMission.status === 'COMPLETED') {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại / Back
        </Link>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-green-100 bg-green-50/80 p-10 text-center dark:border-green-900/40 dark:bg-green-950/30">
          <CheckCircle className="h-16 w-16 text-green-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{userMission.missionName}</h1>
          <p className="text-green-800 dark:text-green-200">
            Nhiệm vụ đã hoàn thành. Điểm thưởng đã được cộng vào ví.
          </p>
          <p className="text-sm text-green-700/90 dark:text-green-300/90">
            This mission is already completed. Points were added to your wallet.
          </p>
        </div>
      </div>
    );
  }

  if (!userMission.videoUrl || !videoId) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="text-slate-700">Nhiệm vụ này chưa có video YouTube hợp lệ.</p>
        <p className="text-sm text-slate-500">This mission has no valid YouTube URL.</p>
        <Link to="/history" className="text-primary-600 font-semibold hover:underline">
          ← My missions
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <Link
        to="/history"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại / Back
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{userMission.missionName}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Xem hết video để tự động nhận +{userMission.points} điểm. / Watch until the end to earn +{userMission.points}{' '}
          points automatically.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-xl dark:border-slate-700">
        <div id={PLAYER_DIV_ID} className="aspect-video w-full" />
      </div>

      {(playerError || rewardMessage) && (
        <div
          className={`rounded-xl p-4 text-center text-sm font-medium ${
            rewardMessage
              ? 'bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-200'
              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200'
          }`}
        >
          {rewardMessage || playerError}
        </div>
      )}

      {isCompleting && (
        <p className="text-center text-sm text-slate-500">
          Đang ghi nhận thưởng… / Recording your reward…
        </p>
      )}
    </div>
  );
};

export default MissionWatchCustomerPage;
