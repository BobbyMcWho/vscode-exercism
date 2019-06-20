import { StorageItem } from "../../../../common/storage";
import { TrackStatus } from "../../../../typings/api";
import { TreeNodeFilter } from "../treeNode";
import { TrackNode } from "./trackNode";

export const enum TrackNodeFilterFlags {
  NONE = 0,
  FILTER_JOINED = 1,
  FILTER_FOCUSED = 2
}

export interface TrackNodeFilterOptions {
  flags: TrackNodeFilterFlags;
  trackToFocus?: string;
}

export class TrackNodeFilter implements TreeNodeFilter<TrackNode> {
  private static _instance: TrackNodeFilter;
  private _filterOptionsStore: StorageItem<TrackNodeFilterOptions>;

  private constructor() {
    this._filterOptionsStore = new StorageItem<TrackNodeFilterOptions>("tree.filter.track", {
      flags: TrackNodeFilterFlags.NONE
    });
  }

  static get instance(): TrackNodeFilter {
    if (!this._instance) {
      this._instance = new TrackNodeFilter();
    }
    return this._instance;
  }

  static clearFilterFlags(): void {
    this._instance._filterOptionsStore.reset();
  }

  static toggleFilterFlags(flags: TrackNodeFilterFlags): void {
    this._instance._filterOptionsStore.mutate(model => {
      model.flags ^= flags;
    });
  }

  static focusTrackNode(trackNode: TrackNode): void {
    this._instance._filterOptionsStore.mutate(model => {
      model.flags ^= TrackNodeFilterFlags.FILTER_FOCUSED;
      model.trackToFocus = trackNode.id;
    });
  }

  sieve(nodes: TrackNode[]): TrackNode[] {
    const { flags, trackToFocus } = this._filterOptionsStore.model;

    if (flags !== TrackNodeFilterFlags.NONE) {
      if (flags & TrackNodeFilterFlags.FILTER_FOCUSED) {
        if (trackToFocus) {
          return nodes.filter(a => a.id === trackToFocus);
        }
      } else {
        if (flags & TrackNodeFilterFlags.FILTER_JOINED) {
          nodes = nodes.filter(a => a.track.status & TrackStatus.JOINED);
        }
      }
    }

    return nodes;
  }
}
