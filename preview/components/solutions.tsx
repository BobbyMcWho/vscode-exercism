import { h } from "preact";
import { ExerciseStatus } from "../../src/typings/api";
import { State } from "./app";

export default ({ solutions, exercise, track, currentTab }: State) => (
  <div className="nav-content" style={{ display: currentTab === "solutions" ? "block" : "none" }}>
    {solutions ? (
      <div className="solution-list">
        {solutions.map(solution => (
          <a
            className="solution"
            href={`https://exercism.io/tracks/${track.id}/exercises/${exercise.id}/solutions/${solution.uuid}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>{solution.author}</div>
              <div>{"★ " + solution.stars}</div>
            </div>
          </a>
        ))}
      </div>
    ) : exercise.status & ExerciseStatus.DOWNLOADED ? (
      undefined
    ) : (
      <div>You need to download this exercise to view its solutions.</div>
    )}
  </div>
);
