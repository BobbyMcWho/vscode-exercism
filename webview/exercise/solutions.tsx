import { h } from "preact";
import { postMessageToVSC } from "../utilities/message";
import { ExerciseState } from "../utilities/store";

const Solutions = (props: ExerciseState) => {
  return props.solutions ? (
    <div class="nav-content">
      <div class="solution-list">
        {props.solutions.map(solution => (
          <a
            class="solution"
            href={`https://exercism.io/tracks/${props.track.id}/exercises/${props.exercise.id}/solutions/${solution.uuid}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>{solution.author}</div>
              <div>{"★ " + solution.stars}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  ) : (
    (() => {
      postMessageToVSC({ command: "getExerciseSolutions", view: "exercise" });
      return undefined;
    })()
  );
};

export default Solutions;
