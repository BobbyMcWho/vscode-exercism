import { ExercismController } from "../../../exercism/controller";
import { NodeFilterProvider } from "../nodeFilterProvider";
import { TrackNode } from "./trackNode";
import { TreeNode } from "./treeNode";

export class RootNode implements TreeNode<TrackNode> {
  constructor(
    public readonly exercismController: ExercismController,
    public readonly nodeFilterProvider: NodeFilterProvider
  ) {}

  async getChildren(): Promise<TrackNode[]> {
    const tracks = await this.exercismController.getAllTracks();
    return this.nodeFilterProvider.filterTrackNodes(tracks.map(track => new TrackNode(this, track)));
  }
}
