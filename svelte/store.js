import { writable } from "svelte/store";

const vscode = acquireVsCodeApi();

export const sendMessageToVSC = (command, payload) => {
  vscode.postMessage({
    command,
    payload
  });
};

export const updateCurrentTabIndex = tab => {
  store.update(store => ({
    ...store,
    currentTabIndex: tab
  }));
};

export const filterByTopic = topic => {
  store.update(store => ({
    ...store,
    topicBeingFiltered: store.topicBeingFiltered === topic ? undefined : topic
  }));
  sendMessageToVSC("filterByTopic", {
    topic
  });
};

export const getExerciseSolutions = () => {
  sendMessageToVSC("getExerciseSolutions");
};

export const handleIncomingMessagesFromVSC = ({ data: { command, payload } }) => {
  if (command === "update") {
    store.update(store => ({
      ...store,
      ...payload,
      currentTabIndex: store.currentTabIndex,
      instructions: payload.instructions,
      solutions: payload.solutions
    }));
  } else if (command === "update:solutions") {
    store.update(store => ({ ...store, solutions: payload.solutions }));
  }
};

window.addEventListener("message", handleIncomingMessagesFromVSC);

export const store = writable({
  currentTabIndex: 0
});
