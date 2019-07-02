import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ExercismController } from "../../exercism/controller";
import { getExerciseIconPath, getTrackIconPath } from "../../exercism/icons";
import { Exercise, ExerciseStatus, Track } from "../../typings/api";
import { CustomIconURI } from "../../typings/vsc";
import { WebviewMessage } from "../../typings/webview";
import { ExerciseNode } from "../tree/nodes/exercise/exerciseNode";
import { TracksTreeProvider } from "../tree/tracksTreeProvider";
import { TreeNodePreview } from "./previewManager";

export class ExerciseInfoPreview implements TreeNodePreview, vscode.Disposable {
  public title: string;
  public iconPath: CustomIconURI;
  public message: WebviewMessage;

  private _disposables: vscode.Disposable[] = [];
  private readonly _onDidUpdateMessage = new vscode.EventEmitter<WebviewMessage>();
  public readonly onDidUpdateMessage = this._onDidUpdateMessage.event;

  constructor(
    private _exerciseNode: ExerciseNode,
    private _exercismController: ExercismController,
    private _tracksTreeProvider: TracksTreeProvider
  ) {
    const track = this._exerciseNode.parent.track;
    const exercise = this._exerciseNode.exercise;
    const exerciseIconPath = getExerciseIconPath(exercise);

    this.title = track.name + " - " + exercise.name;
    this.iconPath = exerciseIconPath;
    this.message = {
      command: "update",
      payload: {
        view: "exercise",
        exercise,
        track,
        exerciseIconPath: {
          light: exerciseIconPath.light.with({ scheme: "vscode-resource" }).toString(),
          dark: exerciseIconPath.dark.with({ scheme: "vscode-resource" }).toString()
        },
        instructions: this.getInstructions(track, exercise)
      }
    };

    this._disposables.push(
      this._tracksTreeProvider.onDidChangeTreeData(node => {
        if (node instanceof ExerciseNode && node.id === this._exerciseNode.id) {
          this._exerciseNode = node;
          this._onDidUpdateMessage.fire({
            command: "update",
            payload: {
              exercise,
              instructions: this.getInstructions(track, exercise)
            }
          });
        }
      })
    );
  }

  dispose(): void {
    this._disposables.forEach(d => d.dispose());
  }

  private getInstructions(track: Track, exercise: Exercise): string | undefined {
    return exercise.status & ExerciseStatus.DOWNLOADED
      ? fs.readFileSync(path.join(this._exercismController.getExerciseDirPath(track, exercise), "README.md"), "UTF8")
      : undefined;
  }

  async receiveMessage(message: WebviewMessage): Promise<void> {
    switch (message.command) {
      case "getExerciseSolutions":
        const solutions = await this._exercismController.getExerciseSolutions(
          this._exerciseNode.parent.track,
          this._exerciseNode.exercise
        );
        this._onDidUpdateMessage.fire({
          command: "update:solutions",
          payload: {
            solutions
          }
        });
        break;
      case "filterByTopic":
        vscode.commands.executeCommand("exercism.view.tracks.filterExercisesByTopic", message.payload.topic);
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
}
