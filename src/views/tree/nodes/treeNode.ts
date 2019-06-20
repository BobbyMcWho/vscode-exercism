import * as vscode from "vscode";

export interface TreeNodeFilter<T> {
  sieve: (nodes: T[]) => T[];
}

export interface TreeNode<T extends TreeNode = TreeNode<any>> extends vscode.TreeItem {
  readonly filter?: TreeNodeFilter<any>;
  readonly parent?: TreeNode;
  getChildren: () => Promise<T[]>;
}
