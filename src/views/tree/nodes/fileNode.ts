import * as vscode from "vscode";
import { ExerciseNode } from "./exerciseNode";
import { TreeNode } from "./treeNode";

export class FileNode implements TreeNode {
  public readonly contextValue = "fileTreeNode";

  constructor(public readonly parent: ExerciseNode, public readonly resourceUri: vscode.Uri) {}

  get command(): vscode.Command {
    return {
      title: "Open Exercise File",
      command: "exercism.file.open",
      arguments: [this]
    };
  }

  async getChildren(): Promise<[]> {
    return [];
  }
}
