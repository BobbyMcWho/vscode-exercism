import { WebviewMessage } from "../../src/typings/webview";
import { store } from "./store";

declare var acquireVsCodeApi: any;

const vscode = acquireVsCodeApi();

export function postMessageToVSC(message: WebviewMessage): void {
  vscode.postMessage(message);
}

window.addEventListener("message", handleIncomingMessage);

function handleIncomingMessage(event: MessageEvent): void {
  const { command, payload } = event.data;
  switch (command) {
    case "update":
      store.setState(state => {
        return {
          ...payload,
          currentTabIndex: state.currentTabIndex,
          instructions: payload.instructions,
          solutions: payload.solutions
        };
      });
      break;
    case "update:solutions":
      store.setState({
        solutions: payload.solutions
      });
    default:
      break;
  }
}
