import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ExerciseNode } from "./exerciseNode";
import { TreeNode } from "./treeNode";

export function getFileNodeExerciseNode(fileNode: FileNode): ExerciseNode {
  const parent = fileNode.parent;
  return parent instanceof ExerciseNode ? parent : getFileNodeExerciseNode(parent);
}

export async function getFileNodesForDir(parent: ExerciseNode | FileNode, dir: string): Promise<FileNode[]> {
  if (fs.existsSync(dir)) {
    return fs.readdirSync(dir).reduce((nodes: FileNode[], filename: string): FileNode[] => {
      if (filename !== ".exercism") {
        const uri = vscode.Uri.file(path.join(dir, filename));
        const stat = fs.lstatSync(uri.fsPath);
        let filenode: FileNode;
        if (stat.isDirectory()) {
          filenode = new FileNode(parent, uri, true);
        } else {
          filenode = new FileNode(parent, uri);
        }
        nodes.push(filenode);
      }
      return nodes;
    }, []);
  }
  return [];
}

export class FileNode implements TreeNode {
  public readonly contextValue = "fileTreeNode";
  public readonly iconPath?: vscode.ThemeIcon;
  public readonly collapsibleState?: vscode.TreeItemCollapsibleState;
  public readonly command?: vscode.Command;

  constructor(
    public readonly parent: ExerciseNode | FileNode,
    public readonly resourceUri: vscode.Uri,
    public readonly isDirectory?: boolean
  ) {
    if (this.isDirectory) {
      this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      this.iconPath = vscode.ThemeIcon.Folder;
    } else {
      this.command = {
        title: "Open Exercise File",
        command: "exercism.file.open",
        arguments: [this]
      };
    }
  }

  async getChildren(): Promise<FileNode[]> {
    return getFileNodesForDir(this, this.resourceUri.fsPath);
  }
}
