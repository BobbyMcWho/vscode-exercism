import { h } from "preact";
import { ExerciseStatus } from "../../src/typings/api";
import { postMessageToVSC } from "../utilities/message";
import { State, store } from "../utilities/store";

const ExerciseHeader = (props: State) => {
  return (
    <header>
      <div class="top-section">
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
                      command: "filterByTopic",
                      payload: {
                        topic
                      }
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
                command: "openStart"
              })
            }
          >
            Open & Start
          </button>
        </div>
      </div>
      <div class="bottom-section">
        {["instructions", "solutions"].map((tab, i) => (
          <a
            href={"#" + tab}
            class={i === props.currentTabIndex ? "nav-link active" : "nav-link"}
            onClick={() => store.setState({ currentTabIndex: i })}
          >
            {tab}
          </a>
        ))}
      </div>
    </header>
  );
};

export default ExerciseHeader;
