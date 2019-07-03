import * as marked from "marked";
import { h } from "preact";
import { StateProps } from "../context";

const Instructions = (state: StateProps) => {
  if (state.instructions) {
    return <div class="nav-content" dangerouslySetInnerHTML={{ __html: marked.parse(state.instructions) }} />;
  } else {
    return <div class="nav-content">You need to download this exercise before you can view its instructions.</div>;
  }
};

export default Instructions;
