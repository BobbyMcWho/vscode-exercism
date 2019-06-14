import { Component, h } from "preact";
import { Exercise, Solution, Track } from "../../src/typings/api";
import { postMessageToVSC } from "../utils/message";
import Header from "./header";
import Instructions from "./instructions";
import Solutions from "./solutions";

export interface State {
  updated: boolean;
  instructions: string;
  solutions?: Solution[];
  exercise: Exercise;
  track: Track;
  trackIconPath: string;
  exerciseIconPath: string;
  currentTab: string;
}

export interface Actions {
  updateCurrentTab: (tab: string) => void;
}

export default class App extends Component<{}, State> {
  public actions: Actions = {
    updateCurrentTab: (tab: string) => {
      if (tab === "solutions") {
        postMessageToVSC("getExerciseSolutions");
      }
      this.setState({
        currentTab: tab
      });
    }
  };

  constructor() {
    super();
    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.actions.updateCurrentTab = this.actions.updateCurrentTab.bind(this);
  }

  componentWillMount(): void {
    window.addEventListener("message", this.handleIncomingMessage);
  }

  componentWillUnmount(): void {
    window.removeEventListener("message", this.handleIncomingMessage);
  }

  handleIncomingMessage(event: MessageEvent): void {
    const { command, payload } = event.data;
    switch (command) {
      case "update:all":
        const { exercise, track, instructions, trackIconPath, exerciseIconPath, solutions } = payload;
        this.setState({
          updated: true,
          exercise,
          track,
          instructions,
          trackIconPath,
          exerciseIconPath,
          solutions,
          currentTab: "instructions"
        });
        break;
      case "update:solutions":
        this.setState({
          solutions: payload.solutions
        });
        break;
      case "update:exercise":
        this.setState({
          exercise: payload.exercise,
          instructions: payload.instructions
        });
        break;
      default:
        break;
    }
  }

  render(): JSX.Element {
    return this.state.updated ? (
      <div className="root">
        <Header {...this.state} {...this.actions} />
        <main>
          <Instructions {...this.state} />
          <Solutions {...this.state} />
        </main>
      </div>
    ) : (
      undefined
    );
  }
}
