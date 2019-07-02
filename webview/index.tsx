import { h, render } from "preact";
import { connect, Provider } from "redux-zero/preact";
import ExerciseView from "./exercise";
import "./style/default.css";
import "./style/markdown.css";
import { State, store } from "./utilities/store";

const App = connect((state: State): State => state)((props: State) => {
  if (props.view === "exercise" && props.exercise) {
    return <ExerciseView {...props} />;
  } else {
    return null;
  }
});

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root") as HTMLElement
);
