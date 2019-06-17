import * as path from "path";
import * as temp from "temp";
import { ExtensionContext } from "vscode";
import { MockMemento } from "./mockMemento";

export class MockExtensionContext implements ExtensionContext {
  extensionPath = path.resolve(__dirname, "..");

  workspaceState = new MockMemento();
  globalState = new MockMemento();
  subscriptions: { dispose(): any }[] = [];

  storagePath: string;
  globalStoragePath: string;
  logPath: string;

  constructor() {
    this.storagePath = temp.mkdirSync("storage-path");
    this.globalStoragePath = temp.mkdirSync("global-storage-path");
    this.logPath = temp.mkdirSync("log-path");
  }

  asAbsolutePath(relativePath: string): string {
    return path.resolve(this.extensionPath, relativePath);
  }

  dispose() {
    this.subscriptions.forEach(sub => sub.dispose());
  }
}
