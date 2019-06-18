import * as vscode from "vscode";
import { ExerciseNode } from "./exerciseNode";
import { TreeNode } from "./treeNode";

export class FileNode implements TreeNode {
  public readonly contextValue = "fileTreeNode";
  public readonly command = {
    title: "Open Exercise File",
    command: "exercism.file.open",
    arguments: [this]
  };

  constructor(public readonly parent: ExerciseNode, public readonly resourceUri: vscode.Uri) {}

  async getChildren(): Promise<[]> {
    return [];
  }
}
