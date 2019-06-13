
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
  track: Track;
  exercise: Exercise;
}

export interface Solutions {
  [id: string]: Solution;
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
