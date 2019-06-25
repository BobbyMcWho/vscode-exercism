import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { Logger } from "../common/logger";
import { StorageItem } from "../common/storage";
import { execute } from "../common/utilities";
import { Exercise, ExerciseStatus, Solution, Track, TrackStatus, UserDataModel } from "../typings/api";
import { getUserConfig } from "./config";
import * as scraper from "./scraper";

export class ExercismController {
  private readonly _userDataStore: StorageItem<UserDataModel>;

  constructor() {
    this._userDataStore = new StorageItem<UserDataModel>("exercism.client.data", {
      config: getUserConfig()
    });
  }

  // Get all available tracks (from local storage or scraping exercism.io).
  async getAllTracks(): Promise<Track[]> {
    return new Promise(resolve =>
      this._userDataStore.mutate(async model => {
        if (!model.tracks) {
          model.tracks = await scraper.fetchAllTracks();
        }
        resolve(model.tracks);
      })
    );
  }

  // Get the exercises associated with the given track.
  async getTrackExercises(track: Track): Promise<Exercise[]> {
    if (!track.exercises) {
      track.exercises = await scraper.fetchTrackExercises(track.id);

      // Read the track directory to find out if any exercises have already been downloaded.
      const trackPath = this.getTrackDirPath(track);
      if (await fs.pathExists(trackPath)) {
        const downloaded = new Set(await fs.readdir(trackPath));

        // Update exercises to reflect their download status after reading track.
        track.exercises.forEach(exercise => {
          if (downloaded.has(exercise.id)) {
            exercise.status |= ExerciseStatus.DOWNLOADED;
          }
        });
      }

      track.status |= TrackStatus.JOINED;
      this._userDataStore.save();
    }
    return track.exercises;
  }

  get userDataConfigDir(): string {
    return this._userDataStore.model.config.workspace;
  }

  loadUserDataFromJSON(json: string): void {
    this._userDataStore.fromJSON(json);
  }

  getUserDataInJSON(): string {
    return this._userDataStore.toJSON();
  }

  // Get the directory path of the given track.
  getTrackDirPath(track: Track): string {
    return path.join(this._userDataStore.model.config.workspace, track.id);
  }

  // Get the directory path of the given exercise.
  getExerciseDirPath(track: Track, exercise: Exercise): string {
    return path.join(this.getTrackDirPath(track), exercise.id);
  }

  // Submit the exercise file for evaluation.
  async submitExerciseFile(exercise: Exercise, uri: vscode.Uri): Promise<void> {
    Logger.debug("exercism", "Submitting exercise file:", uri.toString());

    try {
      await execute(`exercism submit ${uri.fsPath}`);
    } catch (e) {
      throw e;
    }

    if (!(exercise.status & ExerciseStatus.SUBMITTED)) {
      exercise.status |= ExerciseStatus.SUBMITTED;
      this._userDataStore.save();
    }
  }

  // Download the given exercise via the cli client.
  async downloadExercise(track: Track, exercise: Exercise): Promise<void> {
    Logger.debug("exercism", "Downloading exercise:", track.id, exercise.id);

    try {
      await execute(`exercism download --track=${track.id} --exercise=${exercise.id}`);
    } catch (e) {
      throw e;
    }

    if (!(exercise.status & ExerciseStatus.DOWNLOADED)) {
      exercise.status |= ExerciseStatus.DOWNLOADED;
      this._userDataStore.save();
    }
  }

  async getExerciseSolutions(track: Track, exercise: Exercise): Promise<Solution[]> {
    return scraper.fetchExerciseSolutions(track, exercise);
  }

  // Complete the given exercise and increment its track's exercise completion count.
  completeExercise(track: Track, exercise: Exercise): void {
    if (!(exercise.status & ExerciseStatus.COMPLETED)) {
      exercise.status |= ExerciseStatus.COMPLETED;

      if (track.totalExercisesCompleted !== track.totalExercises) {
        track.totalExercisesCompleted++;
      }

      this._userDataStore.save();
    }
  }
}
