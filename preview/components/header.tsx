import { h } from "preact";
import { ExerciseStatus } from "../../src/typings/api";
import { postMessageToVSC } from "../utils/message";
import { Actions, State } from "./app";

export default ({ exercise, trackIconPath, exerciseIconPath, currentTab, updateCurrentTab }: State & Actions) => (
  <header>
    <div className="top-section">
      <div className="icons">
        <div className="track-icon" style={{ backgroundImage: `url(${trackIconPath}` }} />
        <div className="exercise-icon" style={{ backgroundImage: `url(${exerciseIconPath}` }} />
      </div>
      <div className="meta">
        <h3>
          {exercise.name}
          <small className="difficulty">
            {exercise.difficulty.length === 1 ? "Easy" : exercise.difficulty.length === 2 ? "Intermediate" : "Hard"}
          </small>
        </h3>
        <p className="summary">
          {exercise.summary}
          {exercise.topics.map(topic => {
            const tag = "#" + topic;
            return (
              <a style={{ paddingLeft: "4px" }} href={tag} onClick={() => postMessageToVSC("filterByTopic", topic)}>
                {tag}
              </a>
            );
          })}
        </p>
      </div>
      <div className="actions">
        {(() => {
          if (exercise.status & ExerciseStatus.COMPLETED) {
            return (
              <button disabled className="action-btn">
                Complete
              </button>
            );
          } else if (exercise.status & ExerciseStatus.DOWNLOADED) {
            return (
              <button className="action-btn" onClick={() => postMessageToVSC("complete")}>
                Complete
              </button>
            );
          } else {
            return (
              <button className="action-btn" onClick={() => postMessageToVSC("download")}>
                Download
              </button>
            );
          }
        })()}
        <button className="action-btn" onClick={() => postMessageToVSC("openStart")}>
          Open & Start
        </button>
      </div>
    </div>
    <div className="bottom-section">
      {["instructions", "solutions"].map(key => (
        <a
          href={"#" + key}
          className={key === currentTab ? "nav-link active" : "nav-link"}
          onClick={() => updateCurrentTab(key)}
        >
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </a>
      ))}
    </div>
  </header>
);
