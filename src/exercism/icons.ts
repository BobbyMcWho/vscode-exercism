import { memo } from "helpful-decorators";
import * as vscode from "vscode";
import { ExtensionManager } from "../common/context";
import { StorageItem } from "../common/storage";

export interface CustomIcon {
  light: string;
  dark: string;
}

export interface CustomIconURI {
  light: vscode.Uri;
  dark: vscode.Uri;
}

export interface IconCacheModel {
  [id: string]: CustomIcon;
}

export class ExercismIconManager {
  private _iconCacheStore: StorageItem<IconCacheModel>;

  constructor() {
    this._iconCacheStore = new StorageItem<IconCacheModel>("exercism.icons", Object.create(null));
  }

  private getIconFromCache(id: string, light: string, dark: string) {
    let icon = this._iconCacheStore.model[id];
    if (!icon) {
      icon = {
        light: "file://" + ExtensionManager.getAbsolutePath("images/icons/" + light),
        dark: "file://" + ExtensionManager.getAbsolutePath("images/icons/" + dark)
      };
      this._iconCacheStore.update(model => {
        model[id] = icon;
      });
    }
    return {
      light: vscode.Uri.parse(icon.light),
      dark: vscode.Uri.parse(icon.dark)
    };
  }

  @memo()
  getStatusIcon(id: string): CustomIconURI {
    return this.getIconFromCache(id, "status/" + id + ".png", "status/" + id + ".png");
  }

  @memo()
  getExerciseIcon(id: string): CustomIconURI {
    return this.getIconFromCache(id, "exercise/" + id + "-turquoise.png", "exercise/" + id + "-white.png");
  }

  @memo()
  getTrackIcon(id: string): CustomIconURI {
    if (id === "common-lisp") {
      // todo: rename file...
      id = "lisp";
    }
    return this.getIconFromCache(id, "track/" + id + "-hex-white.png", "track/" + id + "-bordered-turquoise.png");
  }
}
