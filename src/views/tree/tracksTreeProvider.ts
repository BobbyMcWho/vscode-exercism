import * as vscode from "vscode";
import { Logger } from "../../common/logger";
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
    Logger.debug("tree", "Creating tracks view.");
    this.root = new RootNode(this._exercismController, this._nodeFilterProvider);
    this.view = vscode.window.createTreeView<TreeNode>("exercism.view.tracks", {
      showCollapseAll: true,
      treeDataProvider: this
    });
  }

  async refresh(node?: TreeNode): Promise<void> {
    Logger.debug("tree", "Refreshing node:", node ? node.id : undefined);
    node ? this._onDidChangeTreeData.fire(node) : this._onDidChangeTreeData.fire();
  }

  getTreeItem(node: TreeNode): vscode.TreeItem {
    Logger.debug("tree", "Getting tree-item of node:", node.id);
    return node;
  }

  getParent(node: TreeNode): TreeNode | undefined {
    Logger.debug("tree", "Getting parent of node:", node.id);
    return node.parent;
  }

  async getChildren(node?: TreeNode): Promise<TreeNode[]> {
    Logger.debug("tree", "Getting children of node:", node ? node.id : undefined);
    return node ? node.getChildren() : this.root.getChildren();
  }
}
