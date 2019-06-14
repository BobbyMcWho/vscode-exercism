import { exec } from "child_process";
import * as fs from "fs";
import { memo } from "helpful-decorators";
import * as path from "path";
import { promisify } from "util";
import * as vscode from "vscode";
import { ExtensionManager } from "../common/context";
import { Logger } from "../common/logger";
import { StorageItem } from "../common/storage";
import { Exercise, ExerciseStatus, Solution, Track, TrackStatus, UserDataModel } from "../typings/api";
import { getUserConfig } from "./config";
import * as scraper from "./scraper";

export interface CustomIconURI {
  light: vscode.Uri;
  dark: vscode.Uri;
}

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
      if (fs.existsSync(trackPath)) {
        const downloaded = new Set(fs.readdirSync(trackPath));

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

  getExerciseIconPath(exercise: Exercise, shouldUseStatus?: boolean) {
    if (shouldUseStatus) {
      if (exercise.status & ExerciseStatus.COMPLETED) {
        return this.getCachedStatusIcon("complete");
      }
      if (exercise.status & ExerciseStatus.SUBMITTED) {
        return this.getCachedStatusIcon("inprogress");
      }
    }
    return this.getCachedExerciseIcon(exercise.id);
  }

  getTrackIconPath(track: Track, shouldUseStatus?: boolean) {
    return this.getCachedTrackIcon(track.id);
  }

  @memo()
  private getCachedTrackIcon(id: string) {
    return {
      light: vscode.Uri.file(ExtensionManager.getAbsolutePath("images/icons/track/" + id + "-hex-white.png")),
      dark: vscode.Uri.file(ExtensionManager.getAbsolutePath("images/icons/track/" + id + "-bordered-turquoise.png"))
    };
  }

  @memo()
  private getCachedExerciseIcon(id: string) {
    return {
      light: vscode.Uri.file(ExtensionManager.getAbsolutePath("images/icons/exercise/" + id + "-turquoise.png")),
      dark: vscode.Uri.file(ExtensionManager.getAbsolutePath("images/icons/exercise/" + id + "-white.png"))
    };
  }

  @memo()
  private getCachedStatusIcon(id: string) {
    return {
      light: vscode.Uri.file(ExtensionManager.getAbsolutePath("images/icons/status/" + id + ".png")),
      dark: vscode.Uri.file(ExtensionManager.getAbsolutePath("images/icons/status/" + id + ".png"))
    };
  }

  // Submit the exercise file for evaluation.
  async submitExerciseFile(exercise: Exercise, uri: vscode.Uri): Promise<void> {
    Logger.debug("exercism", "Submitting exercise file:", uri.toString());

    try {
      await promisify(exec)(`exercism submit ${uri.fsPath}`);
    } catch (err) {
      throw err;
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
      await promisify(exec)(`exercism download --track=${track.id} --exercise=${exercise.id}`);
    } catch (err) {
      throw err;
    }

    exercise.status |= ExerciseStatus.DOWNLOADED;
    this._userDataStore.save();
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
