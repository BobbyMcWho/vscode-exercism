import { ExercismController } from "../../../exercism/controller";
import { TrackNode } from "./track/trackNode";
import { TrackNodeFilter } from "./track/trackNodeFilter";
import { TreeNode } from "./treeNode";

export class RootNode implements TreeNode<TrackNode> {
  public readonly filter: TrackNodeFilter;

  constructor(public readonly exercismController: ExercismController) {
    this.filter = TrackNodeFilter.instance;
  }

  async getChildren(): Promise<TrackNode[]> {
    const tracks = await this.exercismController.getAllTracks();
    return this.filter.sieve(tracks.map(track => new TrackNode(this, track)));
  }
}
