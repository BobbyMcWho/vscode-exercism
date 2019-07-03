import * as vscode from "vscode";
import { ExtensionManager } from "../../common/context";
import { ExercismController } from "../../exercism/controller";
import { ExerciseNode } from "./nodes/exercise/exerciseNode";
import { ExerciseNodeFilter } from "./nodes/exercise/exerciseNodeFilter";
import { FileNode, getFileNodesForDir } from "./nodes/file/fileNode";
import { FileNodeFilter } from "./nodes/file/fileNodeFilter";
import { TrackNode } from "./nodes/track/trackNode";
import { TrackNodeFilter } from "./nodes/track/trackNodeFilter";
import { TreeNode } from "./nodes/treeNode";

export class TracksTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeNode>();
  public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  public readonly view: vscode.TreeView<TreeNode>;
  public readonly trackNodeFilter = new TrackNodeFilter();
  public readonly exerciseNodeFilter = new ExerciseNodeFilter();
  public readonly fileNodeFilter = new FileNodeFilter();

  constructor(private _exercismController: ExercismController) {
    this.view = vscode.window.createTreeView<TreeNode>("exercism.view.tracks", {
      showCollapseAll: true,
      treeDataProvider: this
    });
    ExtensionManager.subscribe(this.view);
  }

  async refresh(node?: TreeNode): Promise<void> {
    this._onDidChangeTreeData.fire(node);
  }

  getTreeItem(node: TreeNode): vscode.TreeItem {
    return node;
  }

  getParent(node: TreeNode): TreeNode | undefined {
    return node.parent;
  }

  async getTrackNodeChildren(trackNode: TrackNode): Promise<ExerciseNode[]> {
    return this.exerciseNodeFilter.filter(
      (await this._exercismController.getTrackExercises(trackNode.track)).map(
        exercise => new ExerciseNode(trackNode, exercise)
      )
    );
  }

  async getExerciseNodeChildren(exerciseNode: ExerciseNode): Promise<FileNode[]> {
    return this.fileNodeFilter.filter(
      await getFileNodesForDir(
        exerciseNode,
        this._exercismController.getExerciseDirPath(exerciseNode.parent.track, exerciseNode.exercise)
      )
    );
  }

  async getFileNodeChildren(fileNode: FileNode): Promise<FileNode[] | never[]> {
    return this.fileNodeFilter.filter(getFileNodesForDir(fileNode, fileNode.resourceUri.fsPath));
  }

  async getRootNodeChildren(): Promise<TrackNode[]> {
    return this.trackNodeFilter.filter(
      (await this._exercismController.getAllTracks()).map(track => new TrackNode(undefined, track))
    );
  }

  async getChildren(node?: TreeNode): Promise<TreeNode[]> {
    if (node instanceof TrackNode) {
      return this.getTrackNodeChildren(node);
    } else if (node instanceof ExerciseNode) {
      return this.getExerciseNodeChildren(node);
    } else if (node instanceof FileNode) {
      return this.getFileNodeChildren(node);
    } else {
      return this.getRootNodeChildren();
    }
  }
}
