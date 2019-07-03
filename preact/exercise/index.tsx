import { Fragment, h } from "preact";
import { StateProps } from "../context";
import ExerciseHeader from "./header";
import Instructions from "./instructions";
import Solutions from "./solutions";

const ExerciseView = (state: StateProps) => {
  return (
    <Fragment>
      <ExerciseHeader {...state} />
      <main>{[<Instructions {...state} />, <Solutions {...state} />][state.currentTabIndex]}</main>
    </Fragment>
  );
};

export default ExerciseView;
