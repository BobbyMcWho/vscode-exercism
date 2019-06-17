import * as fs from "fs";
import * as vscode from "vscode";

export class ExercismTextFileProvider implements vscode.TextDocumentContentProvider {
  private _onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  public readonly onDidChange = this._onDidChangeEmitter.event;

  provideTextDocumentContent(uri: vscode.Uri): string {
    return fs.readFileSync(uri.fsPath, "UTF8");
  }
}
