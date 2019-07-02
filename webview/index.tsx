import { h, render } from "preact";
import { StateContext, StateProvider } from "./context";
import ExerciseView from "./exercise";
import "./style/default.css";
import "./style/markdown.css";

const App = () => {
  return (
    <StateContext.Consumer>
      {state => {
        if (state.view === "exercise") {
          return <ExerciseView {...state} />;
        } else {
          return null;
        }
      }}
    </StateContext.Consumer>
  );
};

render(
  <StateProvider>
    <App />
  </StateProvider>,
  document.getElementById("root")
);
