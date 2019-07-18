import * as fs from "fs-extra";
import * as path from "path";
import { UserConfig } from "../typings/api";

function getUserConfigDirPath(): string {
  if (process.platform === "win32" && process.env.APPDATA) {
    return process.env.APPDATA;
  } else {
    if (process.env.EXERCISM_CONFIG_HOME) {
      return process.env.EXERCISM_CONFIG_HOME;
    }
    if (process.env.XDG_CONFIG_HOME) {
      return process.env.XDG_CONFIG_HOME;
    }
    if (process.env.HOME) {
      return path.join(process.env.HOME, ".config");
    }
  }
  return "";
}

export function getUserConfig(): UserConfig {
  return fs.readJsonSync(path.join(getUserConfigDirPath(), "exercism", "user.json"));
}
