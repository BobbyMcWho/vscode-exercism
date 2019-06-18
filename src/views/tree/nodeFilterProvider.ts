import { StorageItem } from "../../common/storage";
import { compare } from "../../common/utilities";
import { ExerciseStatus, TrackStatus } from "../../typings/api";
import { ExerciseNode } from "./nodes/exerciseNode";
import { TrackNode } from "./nodes/trackNode";

export const enum ExerciseFilter {
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

export const enum TrackFilter {
  NONE = 0,
  FILTER_JOINED = 1,
  FILTER_FOCUSED = 2
}

interface FilterCollectionModel {
  topicToFilter?: string;
  focusedTrackNodeID?: string;
  focusedExerciseNodeID?: string;
  exerciseFilter: ExerciseFilter;
  trackFilter: TrackFilter;
}

export class NodeFilterProvider {
  private readonly _filterCollectionStore: StorageItem<FilterCollectionModel>;

  constructor() {
    this._filterCollectionStore = new StorageItem<FilterCollectionModel>("exercism.view.filters", {
      exerciseFilter: ExerciseFilter.NONE,
      trackFilter: TrackFilter.NONE
    });
  }

  async filterTrackNodes(nodes: TrackNode[]): Promise<TrackNode[]> {
    const filter = this._filterCollectionStore.model.trackFilter;

    if (filter !== TrackFilter.NONE) {
      if (filter & TrackFilter.FILTER_FOCUSED) {
        const focusedID = this._filterCollectionStore.model.focusedTrackNodeID;
        if (focusedID) {
          return nodes.filter(a => a.id === focusedID);
        }
      } else {
        if (filter & TrackFilter.FILTER_JOINED) {
          nodes = nodes.filter(a => a.track.status & TrackStatus.JOINED);
        }
      }
    }

    return nodes;
  }

  async filterExerciseNodes(nodes: ExerciseNode[]): Promise<ExerciseNode[]> {
    const filter = this._filterCollectionStore.model.exerciseFilter;

    if (filter !== ExerciseFilter.NONE) {
      if (filter & ExerciseFilter.FILTER_TOPIC) {
        const topic = this._filterCollectionStore.model.topicToFilter;
        if (topic) {
          nodes = nodes.filter(a => !!a.exercise.topics.find(t => t === topic));
          nodes.forEach(node => node.showTopics());
        }
      }

      if (filter & ExerciseFilter.FILTER_UNCOMPLETED) {
        nodes = nodes.filter(a => !(a.exercise.status & ExerciseStatus.COMPLETED));
      }

      if (filter & ExerciseFilter.FILTER_COMPLETED) {
        nodes = nodes.filter(a => a.exercise.status & ExerciseStatus.COMPLETED);
      }

      if (filter & ExerciseFilter.FILTER_DOWNLOADED) {
        nodes = nodes.filter(a => a.exercise.status & ExerciseStatus.DOWNLOADED);
      }

      if (filter & ExerciseFilter.SORT_BY_NAME) {
        nodes = nodes.sort((a, b) => compare(a.exercise.name, b.exercise.name));
      }

      if (filter & ExerciseFilter.SORT_BY_DIFFICULTY) {
        nodes = nodes.sort((a, b) => compare(a.exercise.difficulty.length, b.exercise.difficulty.length));
      }

      if (filter & ExerciseFilter.SORT_BY_STATUS) {
        nodes = nodes.sort((a, b) => compare(b.exercise.status, a.exercise.status));
      }

      if (filter & ExerciseFilter.SORT_BY_TOPIC) {
        (async () => nodes.forEach(node => node.showTopics()))();
        nodes = nodes.sort((a, b) => compare(b.exercise.topics[0], a.exercise.topics[0]));
      }
    }

    return nodes;
  }

  clearFilters(): void {
    this._filterCollectionStore.reset();
  }

  filterByTopic(topic: string): void {
    this._filterCollectionStore.mutate(model => {
      model.exerciseFilter |= ExerciseFilter.FILTER_TOPIC;
      model.topicToFilter = topic;
    });
  }

  toggleTrackFocus(trackNode: TrackNode): void {
    this._filterCollectionStore.mutate(model => {
      model.trackFilter ^= TrackFilter.FILTER_FOCUSED;
      model.focusedTrackNodeID = trackNode.id;
    });
  }

  focusExerciseNode(exerciseNode: ExerciseNode): void {
    this._filterCollectionStore.mutate(model => {
      model.exerciseFilter ^= ExerciseFilter.FILTER_FOCUSED;
      model.focusedExerciseNodeID = exerciseNode.id;
    });
  }

  toggleTrackFilter(filter: TrackFilter): void {
    this._filterCollectionStore.mutate(model => {
      model.trackFilter ^= filter;
    });
  }

  toggleExerciseFilter(filter: ExerciseFilter): void {
    this._filterCollectionStore.mutate(model => {
      if (filter === ExerciseFilter.FILTER_COMPLETED && model.exerciseFilter & ExerciseFilter.FILTER_UNCOMPLETED) {
        model.exerciseFilter ^= ExerciseFilter.FILTER_UNCOMPLETED;
      } else if (
        filter === ExerciseFilter.FILTER_UNCOMPLETED &&
        model.exerciseFilter & ExerciseFilter.FILTER_COMPLETED
      ) {
        model.exerciseFilter ^= ExerciseFilter.FILTER_COMPLETED;
      }
      model.exerciseFilter ^= filter;
    });
  }
}
