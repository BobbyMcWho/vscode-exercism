import Store from "redux-zero/interfaces/Store";
import { Exercise, Solution, Track } from "../../src/typings/api";

const createStore = require("redux-zero");

export interface TrackState {
  track: Track;
  trackIconPath: string;
}

export interface State {
  currentTabIndex: number;
  view?: "track" | "exercise";
  exercise: Exercise;
  track: Track;
  exerciseIconPath: string;
  trackIconPath: string;
  solutions: Solution[];
  instructions: string;
}

export const store: Store<Partial<State>> = createStore({
  currentTabIndex: 0
});
