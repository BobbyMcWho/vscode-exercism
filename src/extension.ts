import * as vscode from "vscode";
import { RegisterAllCommands } from "./commands";
import { ExtensionManager } from "./common/context";
import { Logger } from "./common/logger";
import { ExercismController } from "./exercism/controller";
import { NodeFilterProvider } from "./views/tree/nodeFilterProvider";
import { TracksTreeProvider } from "./views/tree/tracksTreeProvider";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  ExtensionManager.initialize(context);

  Logger.initialize();

  const exercismController = new ExercismController();
  const nodeFilterProvider = new NodeFilterProvider();
  const tracksTreeProvider = new TracksTreeProvider(exercismController, nodeFilterProvider);

  RegisterAllCommands(exercismController, tracksTreeProvider, nodeFilterProvider);
}
