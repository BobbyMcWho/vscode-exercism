import { h } from "preact";
import { StateProps } from "../context";

const Solutions = (state: StateProps) => {
  if (state.solutions) {
    return (
      <div class="nav-content">
        <div class="solution-list">
          {state.solutions.map(solution => (
            <a
              class="solution"
              href={`https://exercism.io/tracks/${state.track.id}/exercises/${state.exercise.id}/solutions/${
                solution.uuid
              }`}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>{solution.author}</div>
                <div>{"★ " + solution.stars}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  } else {
    state.postMessageToVSC({ command: "getExerciseSolutions" });
    return null;
  }
};

export default Solutions;
