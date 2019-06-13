import * as vscode from "vscode";

export interface TreeNode<T extends TreeNode = TreeNode<any>> extends vscode.TreeItem {
  readonly parent?: TreeNode;
  getChildren: () => Promise<T[]>;
}
