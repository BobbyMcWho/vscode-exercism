import * as vscode from "vscode";

export interface TreeNodeFilter<T> {
  filter: (nodes: T[]) => T[];
}

export interface TreeNode extends vscode.TreeItem {
  readonly parent: TreeNode | undefined;
}
