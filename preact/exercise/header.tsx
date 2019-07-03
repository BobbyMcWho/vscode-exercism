import { h } from "preact";
import { ExerciseStatus } from "../../src/typings/api";
import { StateProps } from "../context";

const ExerciseHeader = (state: StateProps) => {
  return (
    <header>
      <div class="top-section">
        <div
          class="icon"
          style={{
            "--exerciseIconLight": `url("${state.exerciseIconPath.light}")`,
            "--exerciseIconDark": `url("${state.exerciseIconPath.dark}")`
          }}
        />
        <div class="meta">
          <h3>
            {state.exercise.name}
            <small class="difficulty">
              {state.exercise.difficulty.length === 1
                ? "Easy"
                : state.exercise.difficulty.length === 2
                ? "Intermediate"
                : "Hard"}
            </small>
          </h3>
          <p class="summary">
            {state.exercise.summary}
            {state.exercise.topics.map(topic => {
              const tag = "#" + topic;
              return (
                <a
                  style={{
                    paddingLeft: "4px",
                    filter: state.topicBeingFiltered === topic ? "brightness(0.8)" : "none"
                  }}
                  href={tag}
                  onClick={() => state.filterByTopic(topic)}
                >
                  {tag}
                </a>
              );
            })}
          </p>
        </div>
        <div class="actions">
          {(() => {
            if (state.exercise.status & ExerciseStatus.COMPLETED) {
              return (
                <button disabled class="action-btn">
                  Complete
                </button>
              );
            } else if (state.exercise.status & ExerciseStatus.DOWNLOADED) {
              return (
                <button
                  class="action-btn"
                  onClick={() =>
                    state.postMessageToVSC({
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
                    state.postMessageToVSC({
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
              state.postMessageToVSC({
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
            class={i === state.currentTabIndex ? "nav-link active" : "nav-link"}
            onClick={() => state.updateTabIndex(i)}
          >
            {tab}
          </a>
        ))}
      </div>
    </header>
  );
};

export default ExerciseHeader;
