declare var acquireVsCodeApi: any;

export const vscode = acquireVsCodeApi();

export function postMessageToVSC(command: string, ...args: any[]): void {
  vscode.postMessage({ command, args });
}
