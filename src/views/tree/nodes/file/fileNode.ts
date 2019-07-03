import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import * as vscode from "vscode";
import { ExerciseNode } from "../exercise/exerciseNode";
import { TreeNode } from "../treeNode";

export function getFileNodesForDir(parent: ExerciseNode | FileNode, cwd: string): FileNode[] {
  return glob.sync("*", { cwd, nodir: false, absolute: true }).map(file => {
    return new FileNode(parent, vscode.Uri.file(file), fs.statSync(file).isDirectory());
  });
}

export class FileNode implements TreeNode {
  public readonly contextValue: string;
  public readonly iconPath?: vscode.ThemeIcon;
  public readonly collapsibleState?: vscode.TreeItemCollapsibleState;
  public readonly command?: vscode.Command;
  public readonly label: string;

  constructor(
    public readonly parent: ExerciseNode | FileNode,
    public readonly resourceUri: vscode.Uri,
    public readonly isDirectory: boolean
  ) {
    this.label = path.basename(this.resourceUri.fsPath);
    if (this.isDirectory) {
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      this.iconPath = vscode.ThemeIcon.Folder;
      this.contextValue = "fileTreeNode:directory";
    } else {
      this.contextValue = "fileTreeNode:file";
      this.command = {
        title: "Open Exercise File",
        command: "exercism.file.open",
        arguments: [this]
      };
    }
  }

  getExerciseNode(): ExerciseNode {
    return this.parent instanceof ExerciseNode ? this.parent : this.parent.getExerciseNode();
  }
}
