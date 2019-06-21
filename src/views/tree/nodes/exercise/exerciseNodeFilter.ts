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

export interface ExerciseNodeFilterOptions {
  flags: ExerciseNodeFilterFlags;
  topicToFilter?: string;
}

export class ExerciseNodeFilter implements TreeNodeFilter<ExerciseNode> {
  private static _instance: ExerciseNodeFilter;
  private _filterOptionsStore: StorageItem<ExerciseNodeFilterOptions>;

  private constructor() {
    this._filterOptionsStore = new StorageItem<ExerciseNodeFilterOptions>("tree.filter.exercise", {
      flags: ExerciseNodeFilterFlags.NONE
    });
  }

  static get instance(): ExerciseNodeFilter {
    if (!this._instance) {
      this._instance = new ExerciseNodeFilter();
    }
    return this._instance;
  }

  static clearFilterFlags(): void {
    this._instance._filterOptionsStore.reset();
  }

  static filterByTopic(topic: string): void {
    this._instance._filterOptionsStore.mutate(model => {
      if (model.flags & ExerciseNodeFilterFlags.FILTER_TOPIC && topic === model.topicToFilter) {
        model.flags ^= ExerciseNodeFilterFlags.FILTER_TOPIC;
      } else {
        model.flags |= ExerciseNodeFilterFlags.FILTER_TOPIC;
        model.topicToFilter = topic;
      }
    });
  }

  static toggleFilterFlags(flags: ExerciseNodeFilterFlags): void {
    this._instance._filterOptionsStore.mutate(model => {
      if (flags === ExerciseNodeFilterFlags.FILTER_COMPLETED) {
        if (model.flags & ExerciseNodeFilterFlags.FILTER_UNCOMPLETED) {
          model.flags ^= ExerciseNodeFilterFlags.FILTER_UNCOMPLETED;
        }
      } else if (flags === ExerciseNodeFilterFlags.FILTER_UNCOMPLETED) {
        if (model.flags & ExerciseNodeFilterFlags.FILTER_COMPLETED) {
          model.flags ^= ExerciseNodeFilterFlags.FILTER_COMPLETED;
        }
      }
      model.flags ^= flags;
    });
  }

  sieve(nodes: ExerciseNode[]): ExerciseNode[] {
    const { flags, topicToFilter } = this._filterOptionsStore.model;

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

      if (flags & ExerciseNodeFilterFlags.SORT_BY_STATUS) {
        nodes = nodes.sort((a, b) => compare<ExerciseStatus>(b.exercise.status, a.exercise.status));
      }

      if (flags & ExerciseNodeFilterFlags.SORT_BY_TOPIC) {
        (async () => nodes.forEach(node => node.showTopics()))();
        nodes = nodes.sort((a, b) => compare<string>(b.exercise.topics[0], a.exercise.topics[0]));
      }

      if (flags & ExerciseNodeFilterFlags.SORT_BY_DIFFICULTY) {
        nodes = nodes.sort((a, b) => compare<number>(a.exercise.difficulty.length, b.exercise.difficulty.length));
      }
    }

    return nodes;
  }
}
