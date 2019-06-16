import { h } from "preact";
import { State } from "../utilities/store";
import ExerciseHeader from "./header";
import Instructions from "./instructions";
import Solutions from "./solutions";

const ExerciseView = (props: State) => {
  return (
    <div class="flexible">
      <ExerciseHeader {...props} />
      <main>{[<Instructions {...props} />, <Solutions {...props} />][props.currentTabIndex]}</main>
    </div>
  );
};

export default ExerciseView;
