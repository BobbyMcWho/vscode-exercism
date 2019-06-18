import * as vscode from "vscode";
import { ExtensionManager } from "./context";

export enum LogSeverity {
  SILENT = "silent",
  DEBUG = "debug",
  ERROR = "error"
}

export interface Log {
  date: string;
  message: string;
  severity: LogSeverity;
  group: string;
}

export class Logger {
  private static _severity: LogSeverity;

  static initialize() {
    this.updateLogSeverity();

    // Update the log severity when the user changes his/her settings
    ExtensionManager.subscribe(vscode.workspace.onDidChangeConfiguration(() => this.updateLogSeverity()));
  }

  private static updateLogSeverity(): void {
    this._severity = ExtensionManager.getConfigurationItem<LogSeverity>("logging", LogSeverity.SILENT);
  }

  /**
   * Log a debug message.
   *
   * @param group The category to file this log under.
   * @param message The primary message.
   * @param optional The secondary message(s). It should be used to pass Objects referenced by the primary message.
   */
  static debug(group: string, message: string, ...optional: any[]): void {
    this.createLogEntry(LogSeverity.DEBUG, group, message, optional);
  }

  /**
   * Log an error message.
   *
   * @param group The category to file this log under.
   * @param message The primary message.
   * @param optional The secondary message(s). It should be used to pass Objects referenced by the primary message.
   */
  static error(group: string, message: string, ...optional: any[]): void {
    this.createLogEntry(LogSeverity.ERROR, group, message, optional);
  }

  private static createLogEntry(severity: LogSeverity, group: string, message: string, ...optional: any[]): void {
    if (this._severity === severity) {
      const log = {
        date: new Date().toISOString(),
        message: optional.length > 0 ? message + " " + JSON.stringify(optional) : message,
        severity,
        group
      };
      if (severity === LogSeverity.ERROR) {
        console.error(`[${log.date}][${log.group}]: ${log.message}`);
      } else {
        console.log(`[${log.date}][${log.group}]: ${log.message}`);
      }
    }
  }
}
