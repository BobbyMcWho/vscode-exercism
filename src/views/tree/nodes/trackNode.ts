import * as vscode from "vscode";
import { Track } from "../../../typings/api";
import { CustomIconURI } from "../../../typings/vsc";
import { ExerciseNode } from "./exerciseNode";
import { RootNode } from "./rootNode";
import { TreeNode } from "./treeNode";

export class TrackNode implements TreeNode<ExerciseNode> {
  public readonly contextValue: string;
  public readonly id: string;
  public readonly label: string;
  public readonly collapsibleState: vscode.TreeItemCollapsibleState;
  public readonly description: string;
  public readonly iconPath: CustomIconURI;

  constructor(public readonly parent: RootNode, public readonly track: Track) {
    this.contextValue = "trackTreeNode";
    this.id = this.track.id;
    this.label = this.track.name;
    this.description = this.track.totalExercisesCompleted + "/" + this.track.totalExercises;
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.iconPath = this.parent.exercismController.getTrackIconPath(this.track);
  }

  async getChildren(): Promise<ExerciseNode[]> {
    const exercises = await this.parent.exercismController.getTrackExercises(this.track);
    return this.parent.nodeFilterProvider.filterExerciseNodes(
      exercises.map(exercise => new ExerciseNode(this, exercise))
    );
  }
}
