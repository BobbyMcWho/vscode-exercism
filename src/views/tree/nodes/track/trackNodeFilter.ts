import { StorageItem } from "../../../../common/storage";
import { TrackStatus } from "../../../../typings/api";
import { TreeNodeFilter } from "../treeNode";
import { TrackNode } from "./trackNode";

export enum TrackNodeFilterFlags {
  NONE = 0,
  FILTER_JOINED = 1,
  FILTER_FOCUSED = 2
}

interface TrackNodeFilterStore {
  flags: TrackNodeFilterFlags;
  trackToFocus: string | undefined;
}

export class TrackNodeFilter implements TreeNodeFilter<TrackNode> {
  private _store: StorageItem<TrackNodeFilterStore>;

  constructor() {
    this._store = new StorageItem<TrackNodeFilterStore>("tree.filter.track", {
      flags: TrackNodeFilterFlags.NONE,
      trackToFocus: undefined
    });
  }

  clear(): void {
    this._store.reset();
  }

  toggle(flags: TrackNodeFilterFlags): void {
    this._store.update(model => ({
      flags: model.flags ^ flags
    }));
  }

  toggleFocus(trackNode: TrackNode): void {
    this._store.update(model => ({
      flags: model.flags ^ TrackNodeFilterFlags.FILTER_FOCUSED,
      trackToFocus: model.flags & TrackNodeFilterFlags.FILTER_FOCUSED && model.trackToFocus ? undefined : trackNode.id
    }));
  }

  filter(nodes: TrackNode[]): TrackNode[] {
    const { flags, trackToFocus } = this._store.model;

    if (flags !== TrackNodeFilterFlags.NONE) {
      if (flags & TrackNodeFilterFlags.FILTER_FOCUSED) {
        if (trackToFocus) {
          return nodes.filter(a => a.id === trackToFocus);
        }
      } else {
        if (flags & TrackNodeFilterFlags.FILTER_JOINED) {
          return nodes.filter(a => a.track.status & TrackStatus.JOINED);
        }
      }
    }

    return nodes;
  }
}
