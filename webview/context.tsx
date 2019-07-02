import { Component, createContext, h } from "preact";
import { Exercise, Solution, Track } from "../src/typings/api";
import { WebviewMessage } from "../src/typings/webview";

export interface State {
  currentTabIndex: number;
  view: "track" | "exercise";
  exercise: Exercise;
  track: Track;
  solutions: Solution[];
  instructions: string;
  topicBeingFiltered: string;
  exerciseIconPath: {
    light: string;
    dark: string;
  };
}

export interface Actions {
  updateTabIndex: (tab: number) => void;
  postMessageToVSC: (message: WebviewMessage) => void;
  filterByTopic: (topic: string) => void;
}

export type StateProps = Partial<State & Actions>;

export const StateContext = createContext<StateProps>({});

declare var acquireVsCodeApi: any;

const vscode = acquireVsCodeApi();

export class StateProvider extends Component<{}, StateProps> {
  public state = {
    currentTabIndex: 0,
    updateTabIndex: (tab: number) => {
      this.setState({ currentTabIndex: tab });
    },
    postMessageToVSC: (message: WebviewMessage) => {
      vscode.postMessage(message);
    },
    filterByTopic: (topic: string) => {
      this.setState(state => ({
        topicBeingFiltered: state.topicBeingFiltered === topic ? undefined : topic
      }));
      this.state.postMessageToVSC({
        command: "filterByTopic",
        payload: {
          topic
        }
      });
    }
  };

  componentWillMount() {
    window.addEventListener("message", this.handleIncomingMessage);
  }

  componentWillUnMount() {
    window.removeEventListener("message", this.handleIncomingMessage);
  }

  handleIncomingMessage = ({ data: { command, payload } }: MessageEvent) => {
    switch (command) {
      case "update":
        this.setState(state => ({
          ...payload,
          currentTabIndex: state.currentTabIndex,
          instructions: payload.instructions,
          solutions: payload.solutions
        }));
        break;
      case "update:solutions":
        this.setState({ solutions: payload.solutions });
      default:
        break;
    }
  };

  render() {
    return <StateContext.Provider value={this.state}>{this.props.children}</StateContext.Provider>;
  }
}
