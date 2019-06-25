import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ExerciseNode } from "../exercise/exerciseNode";
import { TreeNode } from "../treeNode";

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
          filenode = new FileNode(parent, uri, false);
        }
        nodes.push(filenode);
      }
      return nodes;
    }, []);
  }
  return [];
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
