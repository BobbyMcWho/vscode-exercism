import * as vscode from "vscode";
import { Track } from "../../../typings/api";
import { CustomIconURI } from "../../../typings/vsc";
import { ExerciseNode } from "./exerciseNode";
import { RootNode } from "./rootNode";
import { TreeNode } from "./treeNode";

export class TrackNode implements TreeNode<ExerciseNode> {
  public readonly contextValue = "trackTreeNode";

  constructor(public readonly parent: RootNode, public readonly track: Track) {}

  get id(): string {
    return this.track.id;
  }

  get label(): string {
    return this.track.name;
  }

  get collapsibleState(): vscode.TreeItemCollapsibleState {
    return vscode.TreeItemCollapsibleState.Collapsed;
  }

  get description(): string {
    return this.track.totalExercisesCompleted + "/" + this.track.totalExercises;
  }

  get iconPath(): CustomIconURI {
    return this.parent.exercismController.getTrackIconPath(this.track, true);
  }

  async getChildren(): Promise<ExerciseNode[]> {
    const exercises = await this.parent.exercismController.getTrackExercises(this.track);
    return this.parent.nodeFilterProvider.filterExerciseNodes(
      exercises.map(exercise => new ExerciseNode(this, exercise))
    );
  }
}
