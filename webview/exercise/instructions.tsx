import * as marked from "marked";
import { h } from "preact";
import { State } from "../utilities/store";

const Instructions = (props: State) => {
  return props.instructions ? (
    <div class="nav-content" dangerouslySetInnerHTML={{ __html: marked.parse(props.instructions) }} />
  ) : (
    <div class="nav-content">You need to download this exercise before you can view its instructions.</div>
  );
};

export default Instructions;
