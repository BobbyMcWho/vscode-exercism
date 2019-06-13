import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Logger } from "../../../common/logger";
import { CustomIconURI } from "../../../exercism/controller";
import { Exercise, ExerciseStatus } from "../../../typings/api";
import { FileNode } from "./fileNode";
import { TrackNode } from "./trackNode";
import { TreeNode } from "./treeNode";

export class ExerciseNode implements TreeNode<FileNode> {
  private _showTopics: boolean = false;
  public readonly contextValue = "exerciseTreeNode";

  constructor(public readonly parent: TrackNode, public readonly exercise: Exercise) {}

  get id(): string {
    return this.parent.id + "/" + this.exercise.id;
  }

  get label(): string {
    return this.exercise.name;
  }

  get description(): string {
    return this._showTopics
      ? this.exercise.difficulty + " " + this.exercise.topics.join(", ")
      : this.exercise.difficulty;
  }

  get collapsibleState(): vscode.TreeItemCollapsibleState {
    return this.exercise.status & ExerciseStatus.DOWNLOADED
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None;
  }

  get iconPath(): CustomIconURI {
    return this.parent.parent.exercismController.getExerciseIconPath(this.exercise, true);
  }

  get tooltip(): string {
    return this.exercise.name + " " + this.description;
  }

  get command(): vscode.Command {
    return {
      command: "exercism.exercise.preview",
      arguments: [this],
      title: "Open Exercise Preview"
    };
  }

  showTopics(): void {
    this._showTopics = true;
  }

  async getChildren(): Promise<FileNode[]> {
    Logger.debug("tree", "Getting children for ExerciseNode");
    const dir = this.parent.parent.exercismController.getExerciseDirPath(this.parent.track, this.exercise);
    if (fs.existsSync(dir)) {
      return fs.readdirSync(dir).reduce((nodes: FileNode[], filename: string): FileNode[] => {
        if (filename !== ".exercism") {
          const uri = vscode.Uri.file(path.join(dir, filename));
          const filenode = new FileNode(this, uri);
          nodes.push(filenode);
        }
        return nodes;
      }, []);
    }
    return [];
  }
}
