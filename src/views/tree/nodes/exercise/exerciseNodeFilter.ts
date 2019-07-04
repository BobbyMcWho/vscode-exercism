import { StorageItem } from "../../../../common/storage";
import { compare } from "../../../../common/utilities";
import { ExerciseStatus } from "../../../../typings/api";
import { TreeNodeFilter } from "../treeNode";
import { ExerciseNode } from "./exerciseNode";

export enum ExerciseNodeFilterFlags {
  NONE = 0,
  SORT_BY_NAME = 1,
  SORT_BY_DIFFICULTY = 2,
  SORT_BY_STATUS = 4,
  SORT_BY_TOPIC = 8,
  FILTER_UNCOMPLETED = 16,
  FILTER_COMPLETED = 32,
  FILTER_DOWNLOADED = 64,
  FILTER_FOCUSED = 128,
  FILTER_TOPIC = 256
}

interface ExerciseNodeFilterStore {
  flags: ExerciseNodeFilterFlags;
  topicToFilter: string | undefined;
}

export class ExerciseNodeFilter implements TreeNodeFilter<ExerciseNode> {
  private _store: StorageItem<ExerciseNodeFilterStore>;

  constructor() {
    this._store = new StorageItem<ExerciseNodeFilterStore>("tree.filter.exercise", {
      flags: ExerciseNodeFilterFlags.NONE,
      topicToFilter: undefined
    });
  }

  clear(): void {
    this._store.reset();
  }

  filterByTopic(topic: string): void {
    this._store.update(model => {
      if (model.flags & ExerciseNodeFilterFlags.FILTER_TOPIC && topic === model.topicToFilter) {
        return {
          flags: model.flags ^ ExerciseNodeFilterFlags.FILTER_TOPIC,
          topicToFilter: undefined
        };
      } else {
        return {
          flags: model.flags | ExerciseNodeFilterFlags.FILTER_TOPIC,
          topicToFilter: topic
        };
      }
    });
  }

  toggle(flags: ExerciseNodeFilterFlags): void {
    this._store.update(model => {
      let prevFlags = model.flags;
      if (flags === ExerciseNodeFilterFlags.FILTER_COMPLETED) {
        if (prevFlags & ExerciseNodeFilterFlags.FILTER_UNCOMPLETED) {
          prevFlags ^= ExerciseNodeFilterFlags.FILTER_UNCOMPLETED;
        }
      } else if (flags === ExerciseNodeFilterFlags.FILTER_UNCOMPLETED) {
        if (prevFlags & ExerciseNodeFilterFlags.FILTER_COMPLETED) {
          prevFlags ^= ExerciseNodeFilterFlags.FILTER_COMPLETED;
        }
      }
      return { flags: prevFlags ^ flags };
    });
  }

  filter(nodes: ExerciseNode[]): ExerciseNode[] {
    const { flags, topicToFilter } = this._store.model;
    if (flags !== ExerciseNodeFilterFlags.NONE) {
      if (flags & ExerciseNodeFilterFlags.FILTER_TOPIC && topicToFilter) {
        nodes = nodes.filter(a => !!a.exercise.topics.find(t => t === topicToFilter));
        (async () => nodes.forEach(node => node.showTopics()))();
      }
      if (flags & ExerciseNodeFilterFlags.FILTER_UNCOMPLETED) {
        nodes = nodes.filter(a => !(a.exercise.status & ExerciseStatus.COMPLETED));
      }
      if (flags & ExerciseNodeFilterFlags.FILTER_COMPLETED) {
        nodes = nodes.filter(a => a.exercise.status & ExerciseStatus.COMPLETED);
      }
      if (flags & ExerciseNodeFilterFlags.FILTER_DOWNLOADED) {
        nodes = nodes.filter(a => a.exercise.status & ExerciseStatus.DOWNLOADED);
      }
      if (flags & ExerciseNodeFilterFlags.SORT_BY_NAME) {
        nodes = nodes.sort((a, b) => compare<string>(a.exercise.name, b.exercise.name));
      }
      if (flags & ExerciseNodeFilterFlags.SORT_BY_TOPIC) {
        (async () => nodes.forEach(node => node.showTopics()))();
        nodes = nodes.sort((a, b) => compare<string>(b.exercise.topics[0], a.exercise.topics[0]));
      }
      if (flags & ExerciseNodeFilterFlags.SORT_BY_DIFFICULTY) {
        nodes = nodes.sort((a, b) => compare<number>(a.exercise.difficulty.length, b.exercise.difficulty.length));
      }
      if (flags & ExerciseNodeFilterFlags.SORT_BY_STATUS) {
        nodes = nodes.sort((a, b) => compare<ExerciseStatus>(b.exercise.status, a.exercise.status));
      }
    }
    return nodes;
  }
}
