import * as vscode from "vscode";
import { getExerciseIconPath } from "../../../../exercism/icons";
import { Exercise, ExerciseStatus } from "../../../../typings/api";
import { CustomIconURI } from "../../../../typings/vsc";
import { TrackNode } from "../track/trackNode";
import { TreeNode } from "../treeNode";

export class ExerciseNode implements TreeNode {
  private _isShowingTopics: boolean;
  public readonly contextValue: string;
  public readonly label: string;
  public readonly id: string;
  public readonly command: vscode.Command;

  constructor(public readonly parent: TrackNode, public readonly exercise: Exercise) {
    this._isShowingTopics = false;
    this.contextValue = "exerciseTreeNode";
    this.label = this.exercise.name;
    this.id = this.parent.id + "/" + this.exercise.id;
    this.command = {
      command: "exercism.exercise.preview",
      arguments: [this],
      title: "Open Exercise Preview"
    };
  }

  get iconPath(): CustomIconURI {
    return getExerciseIconPath(this.exercise, true);
  }

  get tooltip(): string {
    return this.exercise.name + " " + this.description;
  }

  get description(): string {
    return this._isShowingTopics
      ? this.exercise.difficulty + " " + this.exercise.topics.join(", ")
      : this.exercise.difficulty;
  }

  get collapsibleState(): vscode.TreeItemCollapsibleState {
    return this.exercise.status & ExerciseStatus.DOWNLOADED
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None;
  }

  showTopics(): void {
    this._isShowingTopics = true;
  }
}
