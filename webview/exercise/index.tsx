import { h } from "preact";
import Content from "../common/content";
import { State } from "../utilities/store";
import ExerciseHeader from "./header";
import Instructions from "./instructions";
import Solutions from "./solutions";

const ExerciseView = (props: State) => {
  return (
    <div class="flexible">
      <ExerciseHeader {...props.exerciseState} activeTab={props.currentTabIndex} />
      <Content
        tabs={[<Instructions {...props.exerciseState} />, <Solutions {...props.exerciseState} />]}
        activeTab={props.currentTabIndex}
      />
    </div>
  );
};

export default ExerciseView;
