import * as vscode from "vscode";

export abstract class DisposableStore implements vscode.Disposable {
  private _subscriptions: vscode.Disposable[] = [];

  /**
   * Subscribe a list of disposables to the disposable event of this store. The
   * disposables that are subscribed will be disposed when this store is disposed.
   *
   * @param disposables The disposables to subscribe.
   */
  subscribe(...disposables: vscode.Disposable[]): void {
    disposables.forEach(disposable => this._subscriptions.push(disposable));
  }

  /**
   * Call dispose() on all subscriptions before removing them.
   */
  dispose(): void {
    this._subscriptions.forEach(subscription => subscription.dispose());
    this._subscriptions.length = 0;
  }
}
