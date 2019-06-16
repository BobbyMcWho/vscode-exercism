const createStore = require("redux-zero");
import Store from "redux-zero/interfaces/Store";
import { Exercise, Solution, Track } from "../../src/typings/api";

export interface TrackState {
  track: Track;
  trackIconPath: string;
}

export interface ExerciseState {
  exercise: Exercise;
  track: Track;
  exerciseIconPath: string;
  trackIconPath: string;
  solutions?: Solution[];
  instructions?: string;
}

export interface State {
  currentTabIndex: number;
  view?: "track" | "exercise";
  trackState?: TrackState;
  exerciseState?: ExerciseState;
}

export const store: Store<State> = createStore({
  currentTabIndex: 0
});
