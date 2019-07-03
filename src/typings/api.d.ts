export const enum ExerciseStatus {
  INACTIVE = 0,
  DOWNLOADED = 1,
  SUBMITTED = 2,
  COMPLETED = 4,
  STARTED = 8,
  PAUSED = 16,
  CANCELLED = 32
}

export const enum TrackStatus {
  INACTIVE = 0,
  JOINED = 1
}

export interface Track {
  id: string;
  name: string;
  summary: string;
  totalExercises: number;
  totalExercisesCompleted: number;
  exercises?: Exercise[];
  status: TrackStatus;
}

export interface Exercise {
  id: string;
  name: string;
  summary: string;
  topics: string[];
  status: ExerciseStatus;
  difficulty: string;
  filesToSubmit?: string[];
}

export interface Solution {
  uuid: string;
  author: string;
  stars: number;
  comments: number;
}

export interface DownloadPayload {
  solution: {
    id: string;
    url: string;
    team: {
      name: string;
      slug: string;
    };
    user: {
      handle: string;
      is_requester: string;
    };
    exercise: {
      id: string;
      instructions_url: string;
      auto_approve: string;
      track: {
        id: string;
        language: string;
      };
    };
    file_download_base_url: string;
    files: string[];
    iteration: {
      submitted_at: string;
    };
  };
}

interface ExerciseMetadata {
  track: string;
  exercise: string;
  id: string;
  url: string;
  handle: string;
  is_requester: boolean;
  auto_approve: boolean;
}

export interface UserConfig {
  apibaseurl: string;
  token: string;
  workspace: string;
}

export interface UserDataModel {
  config: UserConfig;
  tracks?: Track[];
}

declare module "api";
