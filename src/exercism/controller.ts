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
import { CustomIconURI } from "../typings/vsc";
import { ExercismClientController } from "./client";
import { getUserConfig } from "./config";
import * as scraper from "./scraper";

export class ExercismController {
  private readonly _userDataStore: StorageItem<UserDataModel>;
  private _clientController: ExercismClientController;

  constructor() {
    this._userDataStore = new StorageItem<UserDataModel>("exercism.client.data", {
      config: getUserConfig()
    });
    this._clientController = new ExercismClientController(this._userDataStore.model.config);
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

  getExerciseIconPath(exercise: Exercise, shouldUseStatus?: boolean): CustomIconURI {
    if (shouldUseStatus) {
      if (exercise.status & ExerciseStatus.COMPLETED) {
        return this.getIconPath("images/icons/status/complete.png", "images/icons/status/complete.png");
      }
      if (exercise.status & ExerciseStatus.SUBMITTED) {
        return this.getIconPath("images/icons/status/inprogress.png", "images/icons/status/inprogress.png");
      }
    }
    return this.getIconPath(
      "images/icons/exercise/" + exercise.id + "-turquoise.png",
      "images/icons/exercise/" + exercise.id + "-white.png"
    );
  }

  getTrackIconPath(track: Track): CustomIconURI {
    return this.getIconPath(
      "images/icons/track/" + track.id + "-hex-white.png",
      "images/icons/track/" + track.id + "-bordered-turquoise.png"
    );
  }

  @memo()
  private getIconPath(lightRelPath: string, darkRelPath: string): CustomIconURI {
    const lightURI = ExtensionManager.getAbsolutePathURI(lightRelPath);
    const darkURI = ExtensionManager.getAbsolutePathURI(darkRelPath);

    if (!fs.existsSync(lightURI.fsPath) || !fs.existsSync(darkURI.fsPath)) {
      return {
        light: vscode.Uri.parse(
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        ),
        dark: vscode.Uri.parse(
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        )
      };
    }

    return {
      light: lightURI,
      dark: darkURI
    };
  }

  // Submit the exercise file for evaluation.
  async submitExerciseFile(exercise: Exercise, uri: vscode.Uri): Promise<void> {
    Logger.debug("exercism", "Submitting exercise file:", uri.toString());

    try {
      await promisify(exec)(`exercism submit ${uri.fsPath}`);
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
      await this._clientController.downloadExerciseFiles(track, exercise);
    } catch (e) {
      throw e;
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
