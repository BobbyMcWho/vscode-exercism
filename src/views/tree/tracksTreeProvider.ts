import * as vscode from "vscode";
import { ExtensionManager } from "../../common/context";
import { ExercismController } from "../../exercism/controller";
import { NodeFilterProvider } from "./nodeFilterProvider";
import { RootNode } from "./nodes/rootNode";
import { TreeNode } from "./nodes/treeNode";

export class TracksTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  readonly root: TreeNode;
  readonly view: vscode.TreeView<TreeNode>;

  constructor(private _exercismController: ExercismController, private _nodeFilterProvider: NodeFilterProvider) {
    this.root = new RootNode(this._exercismController, this._nodeFilterProvider);
    this.view = vscode.window.createTreeView<TreeNode>("exercism.view.tracks", {
      showCollapseAll: true,
      treeDataProvider: this
    });

    ExtensionManager.subscribe(this.view);
  }

  async refresh(node?: TreeNode): Promise<void> {
    node ? this._onDidChangeTreeData.fire(node) : this._onDidChangeTreeData.fire();
  }

  getTreeItem(node: TreeNode): vscode.TreeItem {
    return node;
  }

  getParent(node: TreeNode): TreeNode | undefined {
    return node.parent;
  }

  async getChildren(node?: TreeNode): Promise<TreeNode[]> {
    return node ? node.getChildren() : this.root.getChildren();
  }
}
