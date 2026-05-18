export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type MissionType = 'VIDEO' | 'DOCUMENT';
export type MissionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type UserMissionStatus = 'PROCESSING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export interface MissionDto {
  id: number;
  name: string;
  description: string;
  missionType: MissionType;
  documentLink?: string;
  imageLink?: string;
  /** YouTube watch / embed URL for video missions */
  videoUrl?: string;
  fromDate?: string;
  toDate?: string;
  missionStatus: MissionStatus;
  points: number;
}

export interface UserMissionDto {
  id: number;
  userId: number;
  userEmail: string;
  missionId: number;
  missionName: string;
  videoUrl?: string;
  status: UserMissionStatus;
  receivedAt: string;
  completedAt?: string;
  points: number;
  pointsAwarded?: boolean;
}

export interface UserMissionUpdateDto {
  missionId: number;
  status?: UserMissionStatus;
}
