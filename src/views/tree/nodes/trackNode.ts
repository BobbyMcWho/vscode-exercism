import * as vscode from "vscode";
import { Track } from "../../../typings/api";
import { ExerciseNode } from "./exerciseNode";
import { RootNode } from "./rootNode";
import { TreeNode } from "./treeNode";

export class TrackNode implements TreeNode<ExerciseNode> {
  public readonly contextValue = "trackTreeNode";
  public readonly id = this.track.id;
  public readonly label = this.track.name;
  public readonly collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
  public readonly description = this.track.totalExercisesCompleted + "/" + this.track.totalExercises;
  public readonly iconPath = this.parent.exercismController.getTrackIconPath(this.track, true);

  constructor(public readonly parent: RootNode, public readonly track: Track) {}

  async getChildren(): Promise<ExerciseNode[]> {
    const exercises = await this.parent.exercismController.getTrackExercises(this.track);
    return this.parent.nodeFilterProvider.filterExerciseNodes(
      exercises.map(exercise => new ExerciseNode(this, exercise))
    );
  }
}
