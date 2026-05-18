export type AchievementStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type AchievementType =
  | 'LOGIN'
  | 'VERIFY_EMAIL'
  | 'VERIFY_PHONE'
  | 'UPLOAD_AVATAR'
  | 'MISSION'
  | 'POLICY';

export type UserAchievementStatus = 'PROCESSING' | 'COMPLETED';

export interface AchievementDto {
  id: number;
  name: string;
  description: string;
  achievementStatus: AchievementStatus;
  achievementType: AchievementType;
  points: number;
}

export interface UserAchievementDto {
  id: number;
  userId: number;
  achievementId: number;
  achievementName: string;
  status: UserAchievementStatus;
  completedAt?: string;
  points: number;
  pointsAwarded?: boolean;
}

export interface UserAchievementJoinDto {
  achievementId: number;
}
