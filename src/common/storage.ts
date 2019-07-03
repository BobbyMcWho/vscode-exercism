import { debounce } from "helpful-decorators";
import { ExtensionManager } from "./context";
import { Logger } from "./logger";

/**
 * StorageItem is a generic object that abstracts away the details of the global storage by
 * providing a repository-like interface to its functions. Each StorageItem can independently
 * update the global storage.
 */
export class StorageItem<T> {
  private _model: T;

  /**
   * Create a new instance of StorageItem by loading its model from global storage
   * using the given key. If no model exists, the default model will be used instead.
   *
   * @param _key The key to use when storing/retrieving the model.
   * @param _defaultModel The model to use when an existing model does not exist.
   */
  constructor(private _key: string, private _defaultModel: T) {
    this._model = this.load();
    ExtensionManager.registerStorageItem(this);
  }

  /**
   * The object representation of a model contained within this item.
   */
  get model(): T {
    return this._model;
  }

  /**
   * The key used to store the model in the global storage.
   */
  get key(): string {
    return this._key;
  }

  private load(): T {
    Logger.debug("storage", "Loading model from storage:", this._key);
    return ExtensionManager.getFromGlobalStorage<T>(this._key, this._defaultModel);
  }

  /**
   * Save the model to the global storage. It is debounced by 10 seconds to avoid
   * the expense of consecutive update calls to the global storage.
   */
  @debounce(3000)
  async save(): Promise<void> {
    Logger.debug("storage", "Saving model to global storage:", this._key);
    ExtensionManager.updateGlobalStorage(this._key, this._model);
  }

  /**
   * Reset the model to its default state.
   */
  reset(): void {
    Logger.debug("storage", "Reseting model to default:", this._key);
    this._model = { ...this._defaultModel };
    this.save();
  }

  /**
   * Update and save the model.
   *
   * @param fn The update callback to use.
   */
  update(fn: (model: T) => Partial<T>): void {
    Logger.debug("storage", "Updating model:", this._key);
    this._model = { ...this._model, ...fn(this._model) };
    this.save();
  }

  /**
   * Delete the model from the global storage.
   */
  delete(): void {
    ExtensionManager.updateGlobalStorage(this._key, undefined);
  }

  /**
   * Set the model equal to the object contents of a json file.
   *
   * @param json The json data to parse and assign to the model.
   */
  fromJSON(json: string): void {
    this._model = { ...JSON.parse(json) };
  }

  /**
   * Return the JSON representation of the model.
   *
   * @param beautify If the JSON should be formatted using 4 spaces (true by default).
   */
  toJSON(beautify: boolean = true): string {
    if (!beautify) {
      return JSON.stringify(this._model);
    } else {
      return JSON.stringify(this._model, null, 4);
    }
  }
}
