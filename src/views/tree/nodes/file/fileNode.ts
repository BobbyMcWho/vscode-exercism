import * as path from "path";
import * as vscode from "vscode";
import { ExerciseNode } from "../exercise/exerciseNode";
import { TreeNode } from "../treeNode";

export async function getFileNodesForDir(parent: ExerciseNode | FileNode, dir: string): Promise<FileNode[]> {
  return (await (await import("fast-glob"))("*", { cwd: dir, absolute: true, objectMode: true, onlyFiles: false })).map(
    file => {
      return new FileNode(parent, vscode.Uri.file(file.path), file.dirent.isDirectory());
    }
  );
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
