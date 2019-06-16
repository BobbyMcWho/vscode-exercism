import { WebviewMessage } from "../../src/typings/webview";
import { store } from "./store";

declare var acquireVsCodeApi: any;

const vscode = acquireVsCodeApi();

export function postMessageToVSC(message: WebviewMessage): void {
  vscode.postMessage(message);
}

window.addEventListener("message", handleIncomingMessage);

function handleIncomingMessage(event: MessageEvent): void {
  const { command, view, payload } = event.data;
  switch (view) {
    case "track":
      store.setState({
        view,
        trackState: { ...payload },
        exerciseState: undefined
      });
      break;
    case "exercise":
      store.setState(state => {
        console.log(payload.solutions ? payload.solutions.length : 0)
        return {
          view,
          trackState: undefined,
          exerciseState: {
            exercise: payload.exercise ? payload.exercise : state.exerciseState.exercise,
            track: payload.track ? payload.track : state.exerciseState.track,
            exerciseIconPath: payload.exerciseIconPath
              ? payload.exerciseIconPath
              : state.exerciseState.exerciseIconPath,
            trackIconPath: payload.trackIconPath ? payload.trackIconPath : state.exerciseState.trackIconPath,
            solutions: payload.solutions ? payload.solutions : payload.solutions,
            instructions: payload.instructions ? payload.instructions : state.exerciseState.instructions
          }
        };
      });
      break;
  }
}
