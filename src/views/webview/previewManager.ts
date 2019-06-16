import * as vscode from "vscode";
import { ExtensionManager } from "../../common/context";
import { CustomIconURI } from "../../typings/vsc";
import { WebviewMessage } from "../../typings/webview";

export interface TreeNodePreview extends vscode.Disposable {
  title: string;
  iconPath: CustomIconURI;
  message: WebviewMessage;
  receiveMessage: (message: WebviewMessage) => Promise<void>;
  readonly onDidUpdateMessage: vscode.Event<WebviewMessage>;
}

export class TreeNodePreviewManager implements vscode.Disposable {
  public static instance?: TreeNodePreviewManager;
  public readonly _panel: vscode.WebviewPanel;
  private _panelDisposables: vscode.Disposable[] = [];
  private _previewDisposables: vscode.Disposable[] = [];

  static async createOrUpdate(preview: TreeNodePreview): Promise<void> {
    if (!TreeNodePreviewManager.instance) {
      TreeNodePreviewManager.instance = new TreeNodePreviewManager();
    }
    TreeNodePreviewManager.instance.update(preview);
  }

  private constructor() {
    this._panel = vscode.window.createWebviewPanel("exercism", "", vscode.ViewColumn.Active, {
      retainContextWhenHidden: true,
      enableCommandUris: false,
      enableFindWidget: false,
      enableScripts: true,
      localResourceRoots: [ExtensionManager.getAbsolutePathURI("images"), ExtensionManager.getAbsolutePathURI("dist")]
    });

    this._panelDisposables.push(this._panel, this._panel.onDidDispose(() => this.dispose()));
  }

  dispose(): void {
    this._panelDisposables.forEach(d => d.dispose());
    this._previewDisposables.forEach(d => d.dispose());
    TreeNodePreviewManager.instance = undefined;
  }

  async update(preview: TreeNodePreview): Promise<void> {
    let d: vscode.Disposable | undefined;
    while ((d = this._previewDisposables.pop())) {
      d.dispose();
    }

    this._previewDisposables.push(
      this._panel.webview.onDidReceiveMessage(message => preview.receiveMessage(message)),
      preview.onDidUpdateMessage(message => this._panel.webview.postMessage(message)),
      preview
    );

    this._panel.title = preview.title;
    this._panel.iconPath = preview.iconPath;
    this._panel.webview.html = this.getHTML();
    this._panel.webview.postMessage(preview.message);

    this._panel.reveal();
  }

  getHTML(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div class="flexible" id=root></div>
        <script src="${ExtensionManager.getAbsolutePathURI("dist/index.js").with({
          scheme: "vscode-resource"
        })}"></script>
      </body>
      </html>
    `;
  }
}
