import { h } from "preact";
import { StateProps } from "../context";
import ExerciseHeader from "./header";
import Instructions from "./instructions";
import Solutions from "./solutions";

const ExerciseView = (state: StateProps) => {
  return (
    <div class="flexible">
      <ExerciseHeader {...state} />
      <main>{[<Instructions {...state} />, <Solutions {...state} />][state.currentTabIndex]}</main>
    </div>
  );
};

export default ExerciseView;
