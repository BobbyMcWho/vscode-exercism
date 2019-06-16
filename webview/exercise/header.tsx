import { h } from "preact";
import { ExerciseStatus } from "../../src/typings/api";
import Header from "../common/header";
import { postMessageToVSC } from "../utilities/message";
import { ExerciseState } from "../utilities/store";

const ExerciseHeader = (props: ExerciseState & { activeTab: number }) => {
  return (
    <Header activeTab={props.activeTab} tabs={["Instructions", "Solutions"]}>
      <div class="icons">
        <div class="track-icon" style={{ backgroundImage: `url(${props.trackIconPath}` }} />
        <div class="exercise-icon" style={{ backgroundImage: `url(${props.exerciseIconPath}` }} />
      </div>
      <div class="meta">
        <h3>
          {props.exercise.name}
          <small class="difficulty">
            {props.exercise.difficulty.length === 1
              ? "Easy"
              : props.exercise.difficulty.length === 2
              ? "Intermediate"
              : "Hard"}
          </small>
        </h3>
        <p class="summary">
          {props.exercise.summary}
          {props.exercise.topics.map(topic => {
            const tag = "#" + topic;
            return (
              <a
                style={{ paddingLeft: "4px" }}
                href={tag}
                onClick={() =>
                  postMessageToVSC({
                    view: "exercise",
                    command: "filterByTopic",
                    payload: topic
                  })
                }
              >
                {tag}
              </a>
            );
          })}
        </p>
      </div>
      <div class="actions">
        {(() => {
          if (props.exercise.status & ExerciseStatus.COMPLETED) {
            return (
              <button disabled class="action-btn">
                Complete
              </button>
            );
          } else if (props.exercise.status & ExerciseStatus.DOWNLOADED) {
            return (
              <button
                class="action-btn"
                onClick={() =>
                  postMessageToVSC({
                    view: "exercise",
                    command: "complete"
                  })
                }
              >
                Complete
              </button>
            );
          } else {
            return (
              <button
                class="action-btn"
                onClick={() =>
                  postMessageToVSC({
                    view: "exercise",
                    command: "download"
                  })
                }
              >
                Download
              </button>
            );
          }
        })()}
        <button
          class="action-btn"
          onClick={() =>
            postMessageToVSC({
              view: "exercise",
              command: "openStart"
            })
          }
        >
          Open & Start
        </button>
      </div>
    </Header>
  );
};

export default ExerciseHeader;
