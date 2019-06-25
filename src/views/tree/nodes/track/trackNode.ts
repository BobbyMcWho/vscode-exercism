import * as vscode from "vscode";
import { getTrackIconPath } from "../../../../exercism/icons";
import { Track } from "../../../../typings/api";
import { CustomIconURI } from "../../../../typings/vsc";
import { TreeNode } from "../treeNode";

export class TrackNode implements TreeNode {
  public readonly contextValue: string;
  public readonly id: string;
  public readonly label: string;
  public readonly collapsibleState: vscode.TreeItemCollapsibleState;
  public readonly iconPath: CustomIconURI;

  constructor(public readonly parent: TreeNode | undefined, public readonly track: Track) {
    this.contextValue = "trackTreeNode";
    this.id = this.track.id;
    this.label = this.track.name;
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.iconPath = getTrackIconPath(this.track);
  }

  get description(): string {
    return this.track.totalExercisesCompleted + "/" + this.track.totalExercises;
  }
}
