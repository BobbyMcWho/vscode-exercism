import { h, render } from "preact";
import { connect, Provider } from "redux-zero/preact";
import ExerciseView from "./exercise";
import "./style/default.css";
import "./style/markdown.css";
import { State, store } from "./utilities/store";

const App = connect(
  (state: State): State => ({ exerciseState: state.exerciseState, currentTabIndex: state.currentTabIndex })
)((props: State) => {
  return props.exerciseState && props.exerciseState.exercise ? (
    <ExerciseView exerciseState={props.exerciseState} currentTabIndex={props.currentTabIndex} />
  ) : (
    undefined
  );
});

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
