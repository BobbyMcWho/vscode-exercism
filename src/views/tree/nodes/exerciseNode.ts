import * as vscode from "vscode";
import { Logger } from "../../../common/logger";
import { Exercise, ExerciseStatus } from "../../../typings/api";
import { FileNode, getFileNodesForDir } from "./fileNode";
import { TrackNode } from "./trackNode";
import { TreeNode } from "./treeNode";

export class ExerciseNode implements TreeNode<FileNode> {
  private _shouldShowTopics: boolean = false;
  public readonly contextValue = "exerciseTreeNode";
  public readonly label = this.exercise.name;
  public readonly id = this.parent.id + "/" + this.exercise.id;
  public readonly iconPath = this.parent.parent.exercismController.getExerciseIconPath(this.exercise, true);
  public readonly tooltip = this.exercise.name + " " + this.description;
  public readonly command = {
    command: "exercism.exercise.preview",
    arguments: [this],
    title: "Open Exercise Preview"
  };

  constructor(public readonly parent: TrackNode, public readonly exercise: Exercise) {}

  get description(): string {
    return this._shouldShowTopics
      ? this.exercise.difficulty + " " + this.exercise.topics.join(", ")
      : this.exercise.difficulty;
  }

  get collapsibleState(): vscode.TreeItemCollapsibleState {
    return this.exercise.status & ExerciseStatus.DOWNLOADED
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None;
  }

  showTopics(): void {
    this._shouldShowTopics = true;
  }

  async getChildren(): Promise<FileNode[]> {
    Logger.debug("tree", "Getting children for ExerciseNode");
    const dir = this.parent.parent.exercismController.getExerciseDirPath(this.parent.track, this.exercise);
    return getFileNodesForDir(this, dir);
  }
}
