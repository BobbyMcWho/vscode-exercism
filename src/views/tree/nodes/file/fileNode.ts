import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ExerciseNode } from "../exercise/exerciseNode";
import { TreeNode } from "../treeNode";
import { FileNodeFilter } from "./fileNodeFilter";

export function getFileNodeExerciseNode(fileNode: FileNode): ExerciseNode {
  const parent = fileNode.parent;
  return parent instanceof ExerciseNode ? parent : getFileNodeExerciseNode(parent);
}

export async function getFileNodesForDir(parent: ExerciseNode | FileNode, dir: string): Promise<FileNode[]> {
  if (fs.existsSync(dir)) {
    return FileNodeFilter.instance.sieve(
      fs.readdirSync(dir).reduce((nodes: FileNode[], filename: string): FileNode[] => {
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
      }, [])
    );
  }
  return [];
}

export class FileNode implements TreeNode<FileNode | never> {
  public readonly contextValue: string;
  public readonly iconPath?: vscode.ThemeIcon;
  public readonly collapsibleState?: vscode.TreeItemCollapsibleState;
  public readonly command?: vscode.Command;
  public readonly label: string;
  public readonly filter: FileNodeFilter;

  constructor(
    public readonly parent: ExerciseNode | FileNode,
    public readonly resourceUri: vscode.Uri,
    public readonly isDirectory: boolean
  ) {
    this.label = path.basename(this.resourceUri.fsPath);
    this.filter = FileNodeFilter.instance;
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

  async getChildren(): Promise<FileNode[] | never[]> {
    return getFileNodesForDir(this, this.resourceUri.fsPath);
  }
}
