import * as fs from "fs-extra";
import * as vscode from "vscode";
import { ExtensionManager } from "../common/context";
import { Exercise, ExerciseStatus, Track } from "../typings/api";
import { CustomIconURI } from "../typings/vsc";

function getStatusIconPath(status: string): CustomIconURI {
  return {
    light: ExtensionManager.getAbsolutePathURI("images/icons/status/" + status + ".png"),
    dark: ExtensionManager.getAbsolutePathURI("images/icons/status/" + status + ".png")
  };
}

export function getTrackIconPath(track: Track): CustomIconURI {
  return {
    light: ExtensionManager.getAbsolutePathURI("images/icons/track/light/" + track.id + ".png"),
    dark: ExtensionManager.getAbsolutePathURI("images/icons/track/dark/" + track.id + ".png")
  };
}

export function getExerciseIconPath(exercise: Exercise, shouldUseStatus?: boolean): CustomIconURI {
  if (shouldUseStatus) {
    if (exercise.status & ExerciseStatus.COMPLETED) {
      return getStatusIconPath("complete");
    }
    if (exercise.status & ExerciseStatus.SUBMITTED) {
      return getStatusIconPath("inprogress");
    }
  }

  const exerciseIconURI = {
    light: ExtensionManager.getAbsolutePathURI("images/icons/exercise/light/" + exercise.id + ".png"),
    dark: ExtensionManager.getAbsolutePathURI("images/icons/exercise/dark/" + exercise.id + ".png")
  };

  if (!fs.existsSync(exerciseIconURI.dark.fsPath)) {
    return {
      light: vscode.Uri.parse("data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI="),
      dark: vscode.Uri.parse("data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI=")
    };
  }

  return exerciseIconURI;
}
