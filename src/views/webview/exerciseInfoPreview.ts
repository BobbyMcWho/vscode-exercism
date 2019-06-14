import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ExtensionManager } from "../../common/context";
import { DisposableStore } from "../../common/lifecycle";
import { Logger } from "../../common/logger";
import { ExercismController } from "../../exercism/controller";
import { Exercise, ExerciseStatus, Track } from "../../typings/api";
import { ExerciseNode } from "../tree/nodes/exerciseNode";
import { TreeNode } from "../tree/nodes/treeNode";
import { TracksTreeProvider } from "../tree/tracksTreeProvider";

export class ExerciseInfoPreview extends DisposableStore {
  private static _instance?: ExerciseInfoPreview;
  private readonly _panel: vscode.WebviewPanel;

  static async createOrShow(
    exerciseNode: ExerciseNode,
    tracksTreeProvider: TracksTreeProvider,
    exercismController: ExercismController
  ): Promise<void> {
    if (!this._instance) {
      this._instance = new ExerciseInfoPreview(exerciseNode, tracksTreeProvider, exercismController);
    } else {
      this._instance.update(exerciseNode);
    }
  }

  static dispose(): void {
    this._instance = undefined;
  }

  constructor(
    private _exerciseNode: ExerciseNode,
    private readonly _tracksTreeProvider: TracksTreeProvider,
    private readonly _exercismController: ExercismController
  ) {
    super();

    Logger.debug("webview", "Creating new webview:", this._exerciseNode.id);

    this._panel = vscode.window.createWebviewPanel("exercism", "", vscode.ViewColumn.Active, {
      retainContextWhenHidden: true,
      enableCommandUris: false,
      enableFindWidget: false,
      enableScripts: true,
      localResourceRoots: [ExtensionManager.getAbsolutePathURI("images"), ExtensionManager.getAbsolutePathURI("dist")]
    });

    this.subscribe(
      this._tracksTreeProvider.onDidChangeTreeData(node => this.updateNodeIfExerciseNode(node)),
      this._panel.onDidDispose(() => this.dispose()),
      this._panel.webview.onDidReceiveMessage(message => this.onDidReceiveMessage(message)),
      this._panel,
      ExerciseInfoPreview
    );

    this.update();
  }

  updateNodeIfExerciseNode(node: TreeNode): void {
    if (node instanceof ExerciseNode && node.id === this._exerciseNode.id) {
      Logger.debug("webview", "Updating ExerciseNode:", node.id);
      this._exerciseNode = node;
      this._panel.webview.postMessage({
        command: "update:exercise",
        payload: {
          exercise: this._exerciseNode.exercise,
          instructions: this.getInstructions(this._exerciseNode.parent.track, this._exerciseNode.exercise)
        }
      });
    }
  }

  async onDidReceiveMessage(message: any): Promise<void> {
    Logger.debug("webview", "Received message:", message);
    switch (message.command) {
      case "getExerciseSolutions":
        const solutions = await this._exercismController.getExerciseSolutions(
          this._exerciseNode.parent.track,
          this._exerciseNode.exercise
        );
        this._panel.webview.postMessage({
          command: "update:solutions",
          payload: {
            solutions
          }
        });
        break;
      case "filterByTopic":
        vscode.commands.executeCommand("exercism.view.tracks.filterExercisesByTopic", message.args[0]);
        break;
      case "openStart":
        vscode.commands.executeCommand("exercism.exercise.openStart", this._exerciseNode);
        break;
      case "complete":
        vscode.commands.executeCommand("exercism.exercise.complete", this._exerciseNode);
        break;
      case "download":
        vscode.commands.executeCommand("exercism.exercise.download", this._exerciseNode);
        break;
      default:
        break;
    }
  }

  async update(exerciseNode: ExerciseNode = this._exerciseNode): Promise<void> {
    Logger.debug("webview", "Updating preview:", exerciseNode.id);

    const exercise = exerciseNode.exercise;
    const track = exerciseNode.parent.track;
    const title = track.name + " - " + exercise.name;

    if (this._panel.title !== title) {
      Logger.debug("webview", "Replacing previous exercise information.");

      const trackIcon = this._exercismController.getTrackIconPath(track);
      const exerciseIcon = this._exercismController.getExerciseIconPath(exercise);

      this._exerciseNode = exerciseNode;
      this._panel.title = title;
      this._panel.iconPath = exerciseIcon;
      this._panel.webview.html = await this.getHTML();
      this._panel.webview.postMessage({
        command: "update:all",
        payload: {
          exercise,
          track,
          trackIconPath: trackIcon.light.with({ scheme: "vscode-resource" }).toString(),
          exerciseIconPath: exerciseIcon.light.with({ scheme: "vscode-resource" }).toString(),
          solutions: [],
          instructions: this.getInstructions(track, exercise)
        }
      });
    }

    this._panel.reveal();
  }

  private getInstructions(track: Track, exercise: Exercise): string | undefined {
    return exercise.status & ExerciseStatus.DOWNLOADED
      ? fs.readFileSync(path.join(this._exercismController.getExerciseDirPath(track, exercise), "README.md"), "UTF8")
      : undefined;
  }

  async getHTML(): Promise<string> {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div class="root" id=root></div>
        <script src="${ExtensionManager.getAbsolutePathURI("dist/index.js").with({
          scheme: "vscode-resource"
        })}"></script>
      </body>
      </html>
    `;
  }
}
